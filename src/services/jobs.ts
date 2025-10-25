import { Worker, Job } from "bullmq";
import { connection, reminderQueue, cleanupQueue } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import {
  sendBookingReminder24hEmail,
  sendBookingReminder1hEmail,
  sendSessionCompletedEmail,
} from "./email";

// Job data types
interface ReminderJobData {
  bookingId: string;
  type: "24h" | "1h";
}

interface CleanupJobData {
  type: "complete-past-bookings" | "send-review-requests";
}

// Reminder Worker
export const reminderWorker = new Worker<ReminderJobData>(
  "booking-reminders",
  async (job: Job<ReminderJobData>) => {
    const { bookingId, type } = job.data;

    console.log(`Processing ${type} reminder for booking ${bookingId}`);

    // Fetch booking with user and listing data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        listing: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking) {
      console.log(`Booking ${bookingId} not found, skipping reminder`);
      return { skipped: true, reason: "booking not found" };
    }

    // Only send reminders for confirmed bookings
    if (booking.status !== "CONFIRMED") {
      console.log(
        `Booking ${bookingId} status is ${booking.status}, skipping reminder`
      );
      return { skipped: true, reason: `status is ${booking.status}` };
    }

    // Check if booking is still in the future
    if (booking.startAt < new Date()) {
      console.log(`Booking ${bookingId} has already started, skipping reminder`);
      return { skipped: true, reason: "booking already started" };
    }

    // Format datetime for display
    const startTime = booking.startAt.toLocaleString("en-IN", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });

    const emailData = {
      userName: booking.user.name || "there",
      listingTitle: booking.listing.title,
      providerName: booking.listing.owner.name || "the provider",
      startTime,
      duration: booking.listing.durationMins,
    };

    // Send appropriate reminder email
    let result;
    if (type === "24h") {
      result = await sendBookingReminder24hEmail(booking.user.email, emailData);
    } else {
      result = await sendBookingReminder1hEmail(booking.user.email, emailData);
    }

    if (result.success) {
      console.log(`✓ Sent ${type} reminder for booking ${bookingId}`);
      
      // Mark reminder as sent in database
      await prisma.booking.update({
        where: { id: bookingId },
        data: { reminderSent: true },
      });
    } else {
      console.error(`✗ Failed to send ${type} reminder for booking ${bookingId}`);
      throw new Error(`Email send failed: ${result.error}`);
    }

    return { success: true, emailSent: result.success };
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs concurrently
  }
);

// Cleanup Worker
export const cleanupWorker = new Worker<CleanupJobData>(
  "booking-cleanup",
  async (job: Job<CleanupJobData>) => {
    const { type } = job.data;

    console.log(`Processing cleanup job: ${type}`);

    if (type === "complete-past-bookings") {
      // Find all confirmed bookings that have passed their end time
      const pastBookings = await prisma.booking.findMany({
        where: {
          status: "CONFIRMED",
          endAt: {
            lt: new Date(),
          },
        },
      });

      console.log(`Found ${pastBookings.length} past bookings to complete`);

      // Update them to COMPLETED status
      const updatePromises = pastBookings.map((booking) =>
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "COMPLETED" },
        })
      );

      await Promise.all(updatePromises);

      console.log(`✓ Completed ${pastBookings.length} past bookings`);

      return { completed: pastBookings.length };
    }

    if (type === "send-review-requests") {
      // Find completed bookings without reviews (within last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const completedBookings = await prisma.booking.findMany({
        where: {
          status: "COMPLETED",
          endAt: {
            gte: sevenDaysAgo,
            lt: new Date(),
          },
        },
        include: {
          user: true,
          listing: {
            include: {
              owner: true,
              reviews: {
                where: {
                  reviewerId: undefined, // Will be set below
                },
              },
            },
          },
        },
      });

      console.log(
        `Found ${completedBookings.length} completed bookings for review requests`
      );

      let emailsSent = 0;

      for (const booking of completedBookings) {
        // Check if user already reviewed this listing
        const existingReview = await prisma.review.findFirst({
          where: {
            reviewerId: booking.userId,
            listingId: booking.listingId,
          },
        });

        if (existingReview) {
          continue; // Skip if already reviewed
        }

        // Send review request email
        const result = await sendSessionCompletedEmail(booking.user.email, {
          userName: booking.user.name || "there",
          listingTitle: booking.listing.title,
          providerName: booking.listing.owner.name || "the provider",
          bookingId: booking.id,
        });

        if (result.success) {
          emailsSent++;
        }
      }

      console.log(`✓ Sent ${emailsSent} review request emails`);

      return { emailsSent };
    }

    return { processed: true };
  },
  {
    connection,
    concurrency: 2,
  }
);

// Worker event handlers
reminderWorker.on("completed", (job) => {
  console.log(`Reminder worker completed job ${job.id}`);
});

reminderWorker.on("failed", (job, err) => {
  console.error(`Reminder worker failed job ${job?.id}:`, err.message);
});

cleanupWorker.on("completed", (job) => {
  console.log(`Cleanup worker completed job ${job.id}`);
});

cleanupWorker.on("failed", (job, err) => {
  console.error(`Cleanup worker failed job ${job?.id}:`, err.message);
});

// Schedule booking reminders
export async function scheduleBookingReminders(bookingId: string, startAt: Date) {
  const now = new Date();
  const startTime = startAt.getTime();

  // Calculate delays
  const delay24h = startTime - 24 * 60 * 60 * 1000 - now.getTime();
  const delay1h = startTime - 60 * 60 * 1000 - now.getTime();

  const scheduledJobs: string[] = [];

  // Schedule 24-hour reminder (if more than 24 hours away)
  if (delay24h > 0) {
    const job24h = await reminderQueue.add(
      "reminder-24h",
      {
        bookingId,
        type: "24h",
      },
      {
        delay: delay24h,
        jobId: `${bookingId}-24h`, // Unique job ID for cancellation
      }
    );
    scheduledJobs.push(job24h.id!);
    console.log(`Scheduled 24h reminder for booking ${bookingId} (delay: ${Math.round(delay24h / 1000 / 60)} minutes)`);
  }

  // Schedule 1-hour reminder (if more than 1 hour away)
  if (delay1h > 0) {
    const job1h = await reminderQueue.add(
      "reminder-1h",
      {
        bookingId,
        type: "1h",
      },
      {
        delay: delay1h,
        jobId: `${bookingId}-1h`,
      }
    );
    scheduledJobs.push(job1h.id!);
    console.log(`Scheduled 1h reminder for booking ${bookingId} (delay: ${Math.round(delay1h / 1000 / 60)} minutes)`);
  }

  return scheduledJobs;
}

// Cancel booking reminders (when booking is cancelled/rescheduled)
export async function cancelBookingReminders(bookingId: string) {
  try {
    // Remove jobs by their unique job IDs
    const job24h = await reminderQueue.getJob(`${bookingId}-24h`);
    if (job24h) {
      await job24h.remove();
      console.log(`Cancelled 24h reminder for booking ${bookingId}`);
    }

    const job1h = await reminderQueue.getJob(`${bookingId}-1h`);
    if (job1h) {
      await job1h.remove();
      console.log(`Cancelled 1h reminder for booking ${bookingId}`);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error cancelling reminders for booking ${bookingId}:`, error);
    return { success: false, error };
  }
}

// Schedule daily cleanup job (called by Vercel Cron)
export async function scheduleDailyCleanup() {
  // Complete past bookings
  await cleanupQueue.add("complete-past-bookings", {
    type: "complete-past-bookings",
  });

  // Send review requests
  await cleanupQueue.add("send-review-requests", {
    type: "send-review-requests",
  });

  console.log("✓ Scheduled daily cleanup jobs");
}
