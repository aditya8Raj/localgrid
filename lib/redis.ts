import { Queue } from 'bullmq';
import Redis from 'ioredis';

// Redis connection configuration
const redisConnection = new Redis(process.env.UPSTASH_REDIS_REST_URL!, {
  maxRetriesPerRequest: null,
});

// Queue for booking reminders
export const reminderQueue = new Queue('reminders', { 
  connection: redisConnection 
});

// Queue for email notifications
export const emailQueue = new Queue('emails', { 
  connection: redisConnection 
});

/**
 * Schedule a booking reminder
 * @param bookingId Booking ID
 * @param sendAt When to send the reminder
 */
export async function scheduleBookingReminder(
  bookingId: string, 
  sendAt: Date
): Promise<void> {
  const delay = sendAt.getTime() - Date.now();
  
  if (delay > 0) {
    await reminderQueue.add(
      'send-reminder',
      { bookingId },
      { 
        delay,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      }
    );
  }
}

/**
 * Schedule multiple reminders for a booking
 * @param bookingId Booking ID
 * @param bookingStartTime Booking start time
 */
export async function scheduleBookingReminders(
  bookingId: string,
  bookingStartTime: Date
): Promise<void> {
  const now = new Date();
  
  // 24 hours before
  const reminder24h = new Date(bookingStartTime.getTime() - 24 * 60 * 60 * 1000);
  if (reminder24h > now) {
    await scheduleBookingReminder(bookingId, reminder24h);
  }
  
  // 1 hour before
  const reminder1h = new Date(bookingStartTime.getTime() - 60 * 60 * 1000);
  if (reminder1h > now) {
    await scheduleBookingReminder(bookingId, reminder1h);
  }
}

/**
 * Queue an email to be sent
 * @param emailData Email data
 */
export async function queueEmail(emailData: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  await emailQueue.add(
    'send-email',
    emailData,
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );
}

/**
 * Cancel scheduled reminders for a booking
 * @param bookingId Booking ID
 */
export async function cancelBookingReminders(bookingId: string): Promise<void> {
  const jobs = await reminderQueue.getJobs(['waiting', 'delayed']);
  
  for (const job of jobs) {
    if (job.data.bookingId === bookingId) {
      await job.remove();
    }
  }
}

// Export connection for workers
export { redisConnection };
