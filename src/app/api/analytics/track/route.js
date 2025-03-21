import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Analytics from "@/models/Analytics";
import User from "@/models/User";
import { isUserAdmin, isAdminPath } from "@/lib/analytics";

export async function POST(request) {
  try {
    await connectDB();

    const data = await request.json();
    const { userId, event, page, duration, metadata } = data;

    // Check for admin path first (quick check)
    if (page && isAdminPath(page)) {
      console.log("Skipping analytics tracking for admin path:", page);
      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "admin-path",
      });
    }

    // If tracking a known user (not anonymous), check if they are an admin
    if (userId && userId !== "anonymous") {
      try {
        // Always do a fresh check - don't rely on client-side flag for this critical check
        const user = await User.findById(userId).select("role");

        // Skip tracking for admin users
        if (user && user.role === "admin") {
          console.log("Skipping analytics tracking for admin user:", userId);
          return NextResponse.json({
            success: true,
            ignored: true,
            reason: "admin-user",
          });
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        // Be extra cautious - if we can't verify, don't track
        return NextResponse.json({
          success: true,
          ignored: true,
          reason: "role-check-error",
        });
      }
    }

    // Special case: If this is a page reload and we don't have a userId yet,
    // don't track to avoid the race condition
    if (
      userId === "anonymous" &&
      event === "pageView" &&
      metadata?.source === "reload"
    ) {
      return NextResponse.json({
        success: true,
        ignored: true,
        reason: "anonymous-reload",
      });
    }

    // Create new analytics event
    const analyticsEvent = new Analytics({
      userId: userId || "anonymous",
      event,
      page,
      duration,
      metadata,
      timestamp: new Date(),
    });

    await analyticsEvent.save();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track analytics" },
      { status: 500 }
    );
  }
}
