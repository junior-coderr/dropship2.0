import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import mongoose from "mongoose";
import { verifyToken } from "@/lib/jwt"; // Add this import

const verifyAuth = (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return verifyToken(token);
};

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id).populate(
      "items.productId",
      "name images price"
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
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
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    var params = await params;
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findOne({
      _id: params.id,
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

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
