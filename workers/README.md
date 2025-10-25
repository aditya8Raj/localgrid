# LocalGrid Background Workers

This directory contains background job workers for handling asynchronous tasks like email reminders and notifications.

## Workers

### 1. Reminder Worker (`reminder-worker.ts`)
- **Purpose**: Sends automated booking reminders
- **Queue**: `reminders`
- **Jobs**: Processes reminder emails 24h and 1h before bookings
- **Concurrency**: 5 concurrent jobs

### 2. Email Worker (`email-worker.ts`)
- **Purpose**: Handles general email queue
- **Queue**: `emails`
- **Jobs**: Processes all queued email notifications
- **Concurrency**: 10 concurrent jobs

## Running Workers

### Development

```bash
# Run workers in development with auto-reload
npm run worker:dev
```

### Production

```bash
# Run workers in production
npm run worker
```

## How It Works

### 1. **Booking Reminders**

When a booking is confirmed (`/api/bookings/[id]/confirm`):
1. Two reminder jobs are scheduled in the `reminders` queue:
   - 24 hours before booking start time
   - 1 hour before booking start time
2. The reminder worker processes these jobs at the scheduled time
3. Sends email using `sendBookingReminder()` from `lib/email.ts`

### 2. **Email Queue**

Any part of the application can queue emails using:
```typescript
import { queueEmail } from '@/lib/redis';

await queueEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Hello</h1>',
  text: 'Hello'
});
```

## Architecture

```
┌─────────────────┐
│  Next.js API    │
│  /api/bookings  │
└────────┬────────┘
         │ scheduleBookingReminders()
         ▼
┌─────────────────┐
│  Redis Queue    │
│  (Upstash)      │
└────────┬────────┘
         │ jobs
         ▼
┌─────────────────┐
│  Worker Process │
│  workers/index  │
└────────┬────────┘
         │ sendEmail()
         ▼
┌─────────────────┐
│  Gmail SMTP     │
│  Nodemailer     │
└─────────────────┘
```

## Environment Variables

Workers require these environment variables (same as main app):

```env
# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."

# Email (Gmail SMTP)
EMAIL_SMTP_HOST="smtp.gmail.com"
EMAIL_SMTP_PORT="587"
EMAIL_SMTP_USER="your-email@gmail.com"
EMAIL_SMTP_PASS="your-app-password"

# Database
DATABASE_URL="postgresql://..."
```

## Deployment

### Option 1: Vercel (Background Functions)
Vercel doesn't support long-running processes, but you can:
- Use Vercel Cron Jobs for periodic cleanup
- Deploy workers on a separate service (Railway, Render, Fly.io)

### Option 2: Railway / Render
1. Deploy workers as a separate service
2. Use the same environment variables
3. Keep workers running 24/7

### Option 3: Docker
```dockerfile
# Worker Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["npm", "run", "worker"]
```

## Monitoring

Workers log to console with emojis for easy monitoring:

- ✅ Job completed successfully
- ❌ Job failed (will retry with exponential backoff)
- 📧 Reminder worker started
- 📬 Email worker started

## Job Retention

- **Completed jobs**: Last 100-200 kept for audit
- **Failed jobs**: Last 50-100 kept for debugging
- Older jobs automatically removed

## Graceful Shutdown

Workers handle `SIGINT` and `SIGTERM` signals gracefully:
1. Stop accepting new jobs
2. Complete currently processing jobs
3. Close Redis connections
4. Exit cleanly

Press `Ctrl+C` to stop workers safely.

## Testing

To test reminders locally:

1. Start the worker:
   ```bash
   npm run worker:dev
   ```

2. Create and confirm a booking through the app

3. Check console logs for scheduled reminders

4. For immediate testing, modify the delay in `lib/redis.ts`:
   ```typescript
   // Change from 24h to 1 minute for testing
   const reminder24h = new Date(bookingStartTime.getTime() - 1 * 60 * 1000);
   ```

## Troubleshooting

### Workers not processing jobs

1. Check Redis connection:
   ```bash
   # Verify UPSTASH_REDIS_REST_URL is set
   echo $UPSTASH_REDIS_REST_URL
   ```

2. Check worker logs for errors

3. Verify jobs are being added to queue:
   ```typescript
   // In your API route
   console.log('Scheduling reminders for booking:', bookingId);
   ```

### Emails not sending

1. Verify Gmail SMTP credentials
2. Check if less secure apps are enabled (for Gmail)
3. Use App Password instead of regular password
4. Check Nodemailer logs in `lib/email.ts`

## Production Checklist

- [ ] Workers running on separate service (Railway/Render)
- [ ] Environment variables configured
- [ ] Redis (Upstash) connected
- [ ] Gmail SMTP working
- [ ] Monitoring/logging set up
- [ ] Error alerting configured
- [ ] Graceful shutdown tested
- [ ] Job retention configured
- [ ] Auto-restart on failure (PM2 or Docker)
