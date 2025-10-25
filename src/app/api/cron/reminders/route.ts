import { NextRequest, NextResponse } from "next/server";
import { reminderQueue } from "@/lib/redis";

export const dynamic = "force-dynamic";

// This endpoint is called by Vercel Cron every 15 minutes to check for due reminders
// Add to vercel.json: { "path": "/api/cron/reminders", "schedule": "*/15 * * * *" }
export async function GET(request: NextRequest) {
  try {
    // Verify request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Checking for due reminder jobs");

    // Get queue stats
    const waiting = await reminderQueue.getWaitingCount();
    const active = await reminderQueue.getActiveCount();
    const delayed = await reminderQueue.getDelayedCount();
    const completed = await reminderQueue.getCompletedCount();
    const failed = await reminderQueue.getFailedCount();

    console.log(`[Cron] Queue stats: ${waiting} waiting, ${active} active, ${delayed} delayed`);

    return NextResponse.json({
      success: true,
      queueStats: {
        waiting,
        active,
        delayed,
        completed,
        failed,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Reminder check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
