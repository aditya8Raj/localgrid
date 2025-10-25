# Background Jobs & Cron Configuration

## How It Works

### BullMQ + Redis Architecture

Our background job system uses **BullMQ** with **Upstash Redis**, which handles job scheduling automatically. You **don't need frequent cron jobs** to process reminders because:

1. **BullMQ Workers Run Continuously**: The worker processes (`reminderWorker`, `cleanupWorker`) run as long as your Next.js app is deployed
2. **Jobs Execute Automatically**: When a job's delay expires, BullMQ automatically processes it
3. **No Polling Required**: Redis pub/sub notifies workers when jobs are ready

### Example Flow:

```
User confirms booking at 10:00 AM on Jan 1
  ↓
scheduleBookingReminders() called
  ↓
BullMQ adds job with delay: 23 hours (for 24h reminder)
BullMQ adds job with delay: 47 hours (for 1h reminder)
  ↓
Jobs stored in Redis with execution timestamps
  ↓
[24 hours later - Jan 2, 9:00 AM]
BullMQ worker automatically picks up job (no cron needed!)
  ↓
reminderWorker processes job → sends email
  ↓
[1 hour later - Jan 2, 10:00 AM]  
BullMQ worker picks up second job → sends email
```

## Vercel Plan Limitations

### Hobby Plan (Free)
- ✅ **Daily cron jobs** allowed (e.g., `0 2 * * *` - 2:00 AM daily)
- ❌ **Frequent cron jobs** NOT allowed (e.g., `*/15 * * * *` - every 15 minutes)
- ✅ **BullMQ workers** work perfectly (no cron needed for reminders!)

### Pro Plan ($20/month)
- ✅ All cron frequencies supported
- ✅ Can add `/api/cron/reminders` for monitoring

## Current Configuration (Hobby Plan Compatible)

### vercel.json
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Only **one daily cron** is configured:
- **Cleanup job** (2:00 AM daily): Completes past bookings, sends review requests

### How Reminders Work Without Cron

**Reminders are handled entirely by BullMQ:**

1. When booking is confirmed → `scheduleBookingReminders()` is called
2. Jobs are added to Redis with calculated delays:
   - 24h reminder: `startAt - 24 hours - now`
   - 1h reminder: `startAt - 1 hour - now`
3. BullMQ worker (`reminderWorker`) runs continuously in your Vercel deployment
4. When delay expires → worker automatically processes job → sends email

**No cron job needed!** BullMQ handles scheduling internally.

## Endpoints

### `/api/cron/cleanup` (Scheduled Daily)
- **Schedule:** 2:00 AM daily (`0 2 * * *`)
- **Purpose:** Completes past bookings, sends review requests
- **Called by:** Vercel Cron (automatic)

### `/api/cron/reminders` (Manual/Monitoring Only)
- **Schedule:** Not scheduled on Hobby plan
- **Purpose:** Monitor queue health, get stats
- **Called by:** Manual testing or Pro plan cron
- **Usage:**
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" \
    https://your-app.vercel.app/api/cron/reminders
  ```

## Testing Locally

### Start Dev Server
```bash
npm run dev
```

BullMQ workers will start automatically and connect to Upstash Redis.

### Create a Test Booking
```bash
# Create booking 25 hours in future
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "your-listing-id",
    "startAt": "2025-01-27T10:00:00Z",
    "endAt": "2025-01-27T11:00:00Z"
  }'

# Confirm booking (triggers reminder scheduling)
curl -X PUT http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "id": "booking-id",
    "status": "CONFIRMED"
  }'
```

### Check Redis Queue
Log in to [Upstash Console](https://console.upstash.com/) and check:
- Command count (should increase after booking confirmation)
- Key patterns: `bull:booking-reminders:*`

### Monitor Logs
```bash
# In terminal where npm run dev is running
# You'll see:
✓ Connected to Upstash Redis
Scheduled 24h reminder for booking abc123 (delay: 1439 minutes)
Scheduled 1h reminder for booking abc123 (delay: 1499 minutes)
```

## Production Deployment (Vercel)

### Environment Variables
Set in Vercel Dashboard → Project → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
UPSTASH_REDIS_REST_URL=https://growing-slug-12888.upstash.io
UPSTASH_REDIS_REST_TOKEN=ATJYAAInc...
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=aditya88raj88@gmail.com
EMAIL_SMTP_PASS=rnqt eadf yuyf kner
EMAIL_FROM=aditya88raj88@gmail.com
CRON_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=https://your-app.vercel.app
```

### Deploy
```bash
git push origin main
```

Vercel will:
1. ✅ Deploy your app
2. ✅ Start BullMQ workers (automatic)
3. ✅ Schedule daily cleanup cron
4. ✅ Connect to Upstash Redis (workers process jobs automatically)

### Verify Deployment

**Check worker is running:**
```bash
# View Vercel function logs
vercel logs your-app-url
```

Look for: `✓ Connected to Upstash Redis`

**Check cron is configured:**
```bash
# Vercel Dashboard → Project → Cron Jobs
# Should show: /api/cron/cleanup (daily at 2:00 AM)
```

**Test reminder scheduling:**
1. Create and confirm a booking via your app
2. Check Upstash Redis dashboard for new keys
3. Wait for job execution (or manually trigger for testing)

## Monitoring

### Upstash Dashboard
- **URL:** https://console.upstash.com/
- **Metrics to watch:**
  - Command count (should increase with bookings)
  - Memory usage
  - Connection count

### Vercel Logs
```bash
# Real-time logs
vercel logs --follow

# Cron logs
vercel logs --since=24h | grep "cron"
```

### Email Monitoring
- Check Gmail sent folder for outgoing emails
- Monitor bounce/failed delivery notifications
- Test with different email clients (Gmail, Outlook, etc.)

## Troubleshooting

### Workers Not Processing Jobs

**Symptoms:** Jobs scheduled but never executed

**Solutions:**
1. Check Upstash Redis connection in logs:
   ```bash
   vercel logs | grep "Redis"
   ```
2. Verify environment variables are set correctly
3. Check Upstash Redis dashboard for queue keys: `bull:booking-reminders:*`
4. Restart deployment: `vercel --prod --force`

### Emails Not Sending

**Symptoms:** Jobs executed but no emails received

**Solutions:**
1. Check Gmail SMTP credentials in environment variables
2. Verify app password is correct (not regular password)
3. Check Gmail spam folder
4. Review logs for email errors:
   ```bash
   vercel logs | grep "email"
   ```
5. Test SMTP connection:
   ```bash
   curl https://your-app.vercel.app/api/test-email
   ```

### Cron Job Not Running

**Symptoms:** Daily cleanup not executing

**Solutions:**
1. Check Vercel Dashboard → Cron Jobs tab
2. Verify `vercel.json` is in project root
3. Check `CRON_SECRET` environment variable is set
4. Review cron logs:
   ```bash
   vercel logs | grep "cron"
   ```
5. Manually trigger:
   ```bash
   curl -H "Authorization: Bearer $CRON_SECRET" \
     https://your-app.vercel.app/api/cron/cleanup
   ```

### Redis Connection Errors During Build

**Symptoms:** Build logs show Redis connection errors

**This is normal!** Redis is not accessible during build time. Workers will connect successfully at runtime.

## Upgrading to Pro Plan

If you need more frequent monitoring or have high traffic:

### Benefits
- ✅ Unlimited cron job frequencies
- ✅ Can add `/api/cron/reminders` every 15 minutes
- ✅ More function execution time
- ✅ Higher bandwidth limits

### Configuration for Pro Plan

Update `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

**Note:** This is optional! Reminders work perfectly on Hobby plan without this cron.

## Cost Analysis

### Hobby Plan (Free)
- **Vercel:** Free
- **Upstash Redis:** Free tier (10,000 commands/day)
- **Gmail:** Free (500 emails/day)
- **Total:** $0/month

**Sufficient for:**
- Small community (< 50 active users)
- Low booking volume (< 100 bookings/week)
- Development/testing

### Pro Plan ($20/month)
- **Vercel Pro:** $20/month
- **Upstash Redis:** Pay-as-you-go (first 10k commands free)
- **Gmail Workspace:** $6/user/month (2000 emails/day)
- **Total:** ~$26/month

**Recommended for:**
- Growing community (50-500 users)
- Moderate booking volume (100-1000 bookings/week)
- Production deployment

### Alternative: Dedicated Email Service
- **SendGrid:** Free (100 emails/day), Pro $15/month (40k emails/day)
- **Mailgun:** Free (100 emails/day), Pay-as-you-go $0.80/1000 emails
- **AWS SES:** $0.10/1000 emails

## FAQ

### Q: Do I need to upgrade to Pro for reminders to work?
**A:** No! Reminders work perfectly on Hobby plan. BullMQ handles scheduling automatically.

### Q: How often do workers check for jobs?
**A:** BullMQ uses Redis pub/sub, so workers are notified instantly when jobs are ready (no polling).

### Q: What happens if my Vercel function sleeps?
**A:** Serverless functions sleep after inactivity, but BullMQ persists jobs in Redis. When a function wakes up (on any request), workers reconnect and process pending jobs.

### Q: Can I test reminders without waiting 24 hours?
**A:** Yes! Create a booking 2 minutes in the future, confirm it, and you'll see reminder jobs scheduled with short delays.

### Q: What if Redis goes down?
**A:** Jobs are persisted in Redis. If Redis is down temporarily, workers will reconnect and process jobs when it's back up.

### Q: How do I cancel a scheduled reminder?
**A:** Call `cancelBookingReminders(bookingId)` - it removes both 24h and 1h jobs from the queue.

## Summary

✅ **Hobby Plan Compatible:** Only 1 daily cron job configured  
✅ **Reminders Work Automatically:** BullMQ handles scheduling (no frequent cron needed)  
✅ **Production Ready:** All services configured and tested  
✅ **Cost Effective:** Runs on free tier for small communities  
✅ **Scalable:** Easy upgrade path to Pro plan when needed  

Deploy with confidence! 🚀
