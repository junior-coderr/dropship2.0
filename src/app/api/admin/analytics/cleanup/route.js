import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Analytics from "@/models/Analytics";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function POST(request) {
  try {
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all admin user IDs
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminUserIds = adminUsers.map((user) => user._id.toString());

    // Delete all analytics entries from admin users
    const adminDeletionResult = await Analytics.deleteMany({
      userId: { $in: adminUserIds },
    });

    // Delete all analytics entries from admin paths
    const pathDeletionResult = await Analytics.deleteMany({
      page: { $regex: /^\/admin/ },
    });

    return NextResponse.json({
      success: true,
      message: "Admin analytics data cleaned up",
      stats: {
        adminUserEntriesRemoved: adminDeletionResult.deletedCount,
        adminPathEntriesRemoved: pathDeletionResult.deletedCount,
      },
    });
  } catch (error) {
    console.error("Error cleaning up admin analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clean up admin analytics" },
      { status: 500 }
    );
  }
}
