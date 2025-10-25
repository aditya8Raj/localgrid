import { Worker } from 'bullmq';
import { redisConnection } from '@/lib/redis';
import { sendBookingReminder } from '@/lib/email';

/**
 * Worker to process booking reminder jobs
 * Sends email reminders for upcoming bookings
 */
const reminderWorker = new Worker(
  'reminders',
  async (job) => {
    const { bookingId } = job.data;
    
    console.log(`Processing reminder for booking: ${bookingId}`);
    
    try {
      await sendBookingReminder(bookingId);
      console.log(`Reminder sent successfully for booking: ${bookingId}`);
    } catch (error) {
      console.error(`Failed to send reminder for booking ${bookingId}:`, error);
      throw error; // Rethrow to trigger retry mechanism
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 reminders concurrently
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
    removeOnFail: { count: 50 }, // Keep last 50 failed jobs
  }
);

// Event listeners for monitoring
reminderWorker.on('completed', (job) => {
  console.log(`✅ Reminder job ${job.id} completed successfully`);
});

reminderWorker.on('failed', (job, err) => {
  console.error(`❌ Reminder job ${job?.id} failed:`, err.message);
});

reminderWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

console.log('📧 Reminder worker started and listening for jobs...');

export default reminderWorker;
