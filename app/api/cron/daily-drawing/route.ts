import { NextRequest, NextResponse } from "next/server";
import { lockTargeting, requestWinningCoordinates, resetDailyCycle, waitForVRFFulfillment } from "@/lib/automation";
import { getCurrentUTCHour } from "@/lib/gameLogic";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hour = getCurrentUTCHour();

  try {
    if (hour === 21) {
      // 21:00 UTC - Targeting Lock
      const result = await lockTargeting();
      return NextResponse.json({
        success: true,
        action: "lockTargeting",
        result,
      });
    } else if (hour === 22) {
      // 22:00 UTC - Request Winning Coordinates
      const result = await requestWinningCoordinates();
      
      // Wait for VRF fulfillment (typically 1-2 blocks)
      const { getCurrentDay } = await import("@/lib/gameLogic");
      const currentDay = getCurrentDay();
      try {
        const vrfResult = await waitForVRFFulfillment(currentDay);
        return NextResponse.json({
          success: true,
          action: "requestWinningCoordinates",
          result: { ...result, vrfResult },
        });
      } catch (vrfError) {
        // VRF might take longer, return partial success
        return NextResponse.json({
          success: true,
          action: "requestWinningCoordinates",
          result,
          warning: "VRF fulfillment pending",
        });
      }
    } else if (hour === 23) {
      // 23:00 UTC - Reset Cycle
      const result = await resetDailyCycle();
      return NextResponse.json({
        success: true,
        action: "resetDailyCycle",
        result,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `No action scheduled for hour ${hour}`,
      });
    }
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


