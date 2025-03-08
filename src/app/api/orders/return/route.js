import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { verifyAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { orderId, itemId, reason, upiId } = await request.json();

    if (!orderId || !itemId || !reason || !upiId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    await connectDB();

    // Find the order and ensure it belongs to the user
    const order = await Order.findOne({ 
      _id: orderId,
      userId: user.id 
    });

    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: "Order not found" 
      }, { status: 404 });
    }

    // Check if order is eligible for return (delivered and within 7 days)
    if (!order.isEligibleForReturn()) {
      return NextResponse.json({ 
        success: false, 
        error: "This order is not eligible for return" 
      }, { status: 400 });
    }

    // Find the specific item in the order
    const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return NextResponse.json({ 
        success: false, 
        error: "Item not found in order" 
      }, { status: 404 });
    }

    // Check if a return request already exists for this item
    if (order.items[itemIndex].returnRequest) {
      return NextResponse.json({ 
        success: false, 
        error: "A return request already exists for this item" 
      }, { status: 400 });
    }

    // Create the return request
    order.items[itemIndex].returnRequest = {
      itemId,
      reason,
      upiId,
      refundAmount: order.items[itemIndex].price * order.items[itemIndex].quantity,
      status: "pending"
    };

    await order.save();

    return NextResponse.json({ 
      success: true, 
      message: "Return request submitted successfully",
      returnRequest: order.items[itemIndex].returnRequest
    });
  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process return request" },
      { status: 500 }
    );
  }
}