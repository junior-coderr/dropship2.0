import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Analytics from "@/models/Analytics";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "7days"; // 24h, 7days, 30days, custom
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = searchParams.get("page");
    const userId = searchParams.get("userId");

    // Determine date range
    let dateFilter = {};
    const now = new Date();

    if (period === "24h") {
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(now.getDate() - 1);
      dateFilter = { timestamp: { $gte: oneDayAgo } };
    } else if (period === "7days") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      dateFilter = { timestamp: { $gte: sevenDaysAgo } };
    } else if (period === "30days") {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      dateFilter = { timestamp: { $gte: thirtyDaysAgo } };
    } else if (period === "custom" && startDate && endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // Get admin user IDs to exclude them from analytics
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    const adminUserIds = adminUsers.map((user) => user._id.toString());

    // Build additional filters
    let filters = {
      ...dateFilter,
      // Exclude admin pages and admin users
      page: { $not: /^\/admin.*/ },
      userId: { $nin: adminUserIds },
    };

    if (page) filters.page = page;
    if (userId && !adminUserIds.includes(userId)) filters.userId = userId;

    // Get page views per day
    const dailyPageViews = await Analytics.aggregate([
      { $match: { ...filters, event: "pageView" } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get unique visitors per day
    const dailyUniqueVisitors = await Analytics.aggregate([
      { $match: { ...filters, event: "pageView" } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            user: "$userId",
          },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get average time spent per page
    const avgTimeSpent = await Analytics.aggregate([
      { $match: { ...filters, event: "exit", duration: { $gt: 0 } } },
      {
        $group: {
          _id: "$page",
          avgDuration: { $avg: "$duration" },
          totalVisits: { $sum: 1 },
        },
      },
      { $sort: { totalVisits: -1 } },
      { $limit: 10 },
    ]);

    // Get most visited pages
    const mostVisitedPages = await Analytics.aggregate([
      { $match: { ...filters, event: "pageView" } },
      {
        $group: {
          _id: "$page",
          visits: { $sum: 1 },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: 10 },
    ]);

    // Get bounce rate (users who view only one page)
    const bounceRate = await Analytics.aggregate([
      { $match: { ...filters, event: "pageView" } },
      {
        $group: {
          _id: "$userId",
          pageCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          bounceUsers: {
            $sum: { $cond: [{ $eq: ["$pageCount", 1] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          bounceRate: {
            $multiply: [{ $divide: ["$bounceUsers", "$totalUsers"] }, 100],
          },
        },
      },
    ]);

    // Get user engagement stats by hour
    const hourlyEngagement = await Analytics.aggregate([
      { $match: { ...filters } },
      {
        $group: {
          _id: {
            hour: { $hour: "$timestamp" },
            event: "$event",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.hour": 1 } },
    ]);

    return NextResponse.json({
      success: true,
      analytics: {
        dailyPageViews,
        dailyUniqueVisitors,
        avgTimeSpent,
        mostVisitedPages,
        bounceRate: bounceRate[0]?.bounceRate || 0,
        hourlyEngagement,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
