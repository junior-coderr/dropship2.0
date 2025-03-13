import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const adminUser = await isAdmin(request);
    // console.log("adminUser", adminUser);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all orders for different statuses
    const allOrders = await Order.find();
    const deliveredOrders = allOrders.filter(
      (order) => order.status === "delivered"
    );
    const pendingOrders = allOrders.filter(
      (order) => order.status === "pending"
    );

    // Calculate revenue from delivered orders only
    const revenue = deliveredOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    const productsCount = await Product.countDocuments();
    const customersCount = await User.countDocuments({ role: "user" });
    const totalOrdersCount = allOrders.length;
    const pendingOrdersCount = pendingOrders.length;

    // Get previous month's stats
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const previousMonthOrders = await Order.find({
      createdAt: {
        $gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        $lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1),
      },
    });

    const previousMonthDelivered = previousMonthOrders.filter(
      (order) => order.status === "delivered"
    );
    const previousRevenue = previousMonthDelivered.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return (((current - previous) / previous) * 100).toFixed(1);
    };

    return NextResponse.json({
      success: true,
      stats: {
        revenue: revenue.toFixed(2),
        orders: totalOrdersCount, // Changed from object to single number
        pendingOrders: pendingOrdersCount, // Additional stats as separate fields
        deliveredOrders: deliveredOrders.length,
        products: productsCount,
        customers: customersCount,
        changes: {
          revenue: calculateChange(revenue, previousRevenue),
          orders: calculateChange(totalOrdersCount, previousMonthOrders.length),
          products: 0,
          customers: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
