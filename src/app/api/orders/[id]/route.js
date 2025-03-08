import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { verifyAuth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const order = await Order.findOne({
      _id: id,
      userId: user.id,
    }).populate("items.productId");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findOne({
      _id: id,
      userId: user.id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only allow cancellation if order is in pending or confirmed state
    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json(
        { error: "Order cannot be cancelled in current status" },
        { status: 400 }
      );
    }

    order.status = "cancelled";
    await order.save();

    // Re-fetch the order with populated product data
    const populatedOrder = await Order.findById(order._id).populate("items.productId");

    return NextResponse.json({
      success: true,
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
