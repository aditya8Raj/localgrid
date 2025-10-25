#!/usr/bin/env node

/**
 * Combined worker process for all background jobs
 * Runs both reminder and email workers in a single Node.js process
 * 
 * Usage: node workers/index.ts
 * Or with tsx: tsx workers/index.ts
 */

import reminderWorker from './reminder-worker';
import emailWorker from './email-worker';

console.log('🚀 Starting LocalGrid background workers...');
console.log('');
console.log('Active workers:');
console.log('  - Reminder Worker (booking reminders)');
console.log('  - Email Worker (general email queue)');
console.log('');
console.log('Press Ctrl+C to stop workers');
console.log('');

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down workers...');
  
  await Promise.all([
    reminderWorker.close(),
    emailWorker.close(),
  ]);
  
  console.log('✅ Workers shut down gracefully');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Received SIGTERM, shutting down workers...');
  
  await Promise.all([
    reminderWorker.close(),
    emailWorker.close(),
  ]);
  
  console.log('✅ Workers shut down gracefully');
  process.exit(0);
});

// Keep the process alive
process.stdin.resume();
