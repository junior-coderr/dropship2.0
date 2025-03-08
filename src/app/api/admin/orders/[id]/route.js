import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { isAdmin } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const order = await Order.findById(id).populate(
      "items.productId",
      "name images price"
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const order = await Order.findById(id).populate("items.productId");
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const { status } = await request.json();

    // Validate status transition
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["shipped", "cancelled"],
      shipped: ["delivered", "cancelled"],
      delivered: [], // Cannot change status once delivered
      cancelled: [], // Cannot change status once cancelled
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status transition from ${order.status} to ${status}`,
        },
        { status: 400 }
      );
    }

    order.status = status;
    
    // Set deliveredAt timestamp when order is marked as delivered
    if (status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }
    
    await order.save();

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}
