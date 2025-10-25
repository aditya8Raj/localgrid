import { NextRequest, NextResponse } from "next/server";
import { scheduleDailyCleanup } from "@/services/jobs";

export const dynamic = "force-dynamic";

// This endpoint is called by Vercel Cron
// Add to vercel.json: { "path": "/api/cron/cleanup", "schedule": "0 2 * * *" }
export async function GET(request: NextRequest) {
  try {
    // Verify request is from Vercel Cron (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Cron] Starting daily cleanup job");

    // Schedule cleanup jobs
    await scheduleDailyCleanup();

    return NextResponse.json({
      success: true,
      message: "Daily cleanup jobs scheduled",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] Daily cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
