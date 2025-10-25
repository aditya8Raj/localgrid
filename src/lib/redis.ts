import Redis from "ioredis";
import { Queue, Worker, QueueEvents } from "bullmq";

// Upstash Redis connection
const connection = new Redis(process.env.UPSTASH_REDIS_REST_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: {
    // Upstash requires TLS
    rejectUnauthorized: true,
  },
});

connection.on("connect", () => {
  console.log("✓ Connected to Upstash Redis");
});

connection.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export { connection };

// BullMQ Queues
export const reminderQueue = new Queue("booking-reminders", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
});

export const cleanupQueue = new Queue("booking-cleanup", {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "fixed",
      delay: 10000,
    },
  },
});

// Queue Events for monitoring
export const reminderQueueEvents = new QueueEvents("booking-reminders", {
  connection,
});

export const cleanupQueueEvents = new QueueEvents("booking-cleanup", {
  connection,
});

// Log queue events
reminderQueueEvents.on("completed", ({ jobId }) => {
  console.log(`✓ Reminder job ${jobId} completed`);
});

reminderQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`✗ Reminder job ${jobId} failed:`, failedReason);
});

cleanupQueueEvents.on("completed", ({ jobId }) => {
  console.log(`✓ Cleanup job ${jobId} completed`);
});

cleanupQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`✗ Cleanup job ${jobId} failed:`, failedReason);
});
