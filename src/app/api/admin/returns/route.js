import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Order from "@/models/Order";
import { isAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const { user, error } = await isAdmin(request);
    if (error || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Find all orders with at least one item that has a return request
    // Populate the product details for each item
    const orders = await Order.find({
      "items.returnRequest": { $exists: true }
    }).populate('items.productId')
      .sort({ updatedAt: -1 });

    // Format the response data to focus on return requests
    const returnRequests = orders.flatMap(order => {
      return order.items
        .filter(item => item.returnRequest)
        .map(item => ({
          orderId: order._id,
          orderDate: order.createdAt,
          deliveredAt: order.deliveredAt,
          orderStatus: order.status,
          item: {
            itemId: item._id,
            productId: item.productId, // This will now have populated product data
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color
          },
          returnRequest: item.returnRequest,
          userId: order.userId,
          shippingAddress: order.shippingAddress
        }));
    });

    return NextResponse.json({ 
      success: true, 
      returnRequests
    });
  } catch (error) {
    console.error("Error fetching return requests:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch return requests" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { user, error } = await isAdmin(request);
    if (error || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
    }
    
    const { orderId, itemId, status } = await request.json();
    
    if (!orderId || !itemId || !status) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }
    
    if (!['approved', 'rejected', 'refunded'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid status. Must be 'approved', 'rejected', or 'refunded'" 
      }, { status: 400 });
    }
    
    await connectDB();
    
    // Find the order and update the return request status
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json({ 
        success: false, 
        error: "Order not found" 
      }, { status: 404 });
    }
    
    // Find the specific item in the order
    const itemIndex = order.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1 || !order.items[itemIndex].returnRequest) {
      return NextResponse.json({ 
        success: false, 
        error: "Return request not found" 
      }, { status: 404 });
    }
    
    // Update the return request status
    order.items[itemIndex].returnRequest.status = status;
    
    // If status is "refunded", set the refundedAt date
    if (status === "refunded") {
      order.items[itemIndex].returnRequest.refundedAt = new Date();
    }
    
    await order.save();
    
    return NextResponse.json({ 
      success: true, 
      message: `Return request ${status} successfully`,
      returnRequest: order.items[itemIndex].returnRequest
    });
  } catch (error) {
    console.error("Error updating return request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update return request" },
      { status: 500 }
    );
  }
}