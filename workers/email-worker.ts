import { Worker } from 'bullmq';
import { redisConnection } from '@/lib/redis';
import { sendEmail } from '@/lib/email';

/**
 * Worker to process generic email sending jobs
 * Handles all non-reminder emails through a queue
 */
const emailWorker = new Worker(
  'emails',
  async (job) => {
    const { to, subject, html, text } = job.data;
    
    console.log(`Sending email to: ${to}, subject: ${subject}`);
    
    try {
      await sendEmail({ to, subject, html, text });
      console.log(`Email sent successfully to: ${to}`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error; // Rethrow to trigger retry mechanism
    }
  },
  {
    connection: redisConnection,
    concurrency: 10, // Process up to 10 emails concurrently
    removeOnComplete: { count: 200 }, // Keep last 200 completed jobs
    removeOnFail: { count: 100 }, // Keep last 100 failed jobs
  }
);

// Event listeners for monitoring
emailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err.message);
});

emailWorker.on('error', (err) => {
  console.error('❌ Email worker error:', err);
});

console.log('📬 Email worker started and listening for jobs...');

export default emailWorker;
