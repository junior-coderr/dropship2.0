import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";
import { sendOTP } from "@/lib/twilio";

export async function POST(request) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user's cart
    const cart = await Cart.findOne({ userId: user.id }).populate(
      "items.productId"
    );
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Get user's address and validate
    const userDoc = await User.findById(user.id);
    if (
      !userDoc.address ||
      !userDoc.address.houseNumber ||
      !userDoc.address.roadName ||
      !userDoc.address.city ||
      !userDoc.address.state ||
      !userDoc.address.zipCode
    ) {
      return NextResponse.json(
        { error: "Shipping address required" },
        { status: 400 }
      );
    }

    const { paymentMethod } = await request.json();

    // Filter out items with null/undefined productId
    const validCartItems = cart.items.filter(item => item.productId != null);
    
    if (validCartItems.length === 0) {
      return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
    }

    const order = await Order.create({
      userId: user.id,
      items: validCartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      })),
      totalAmount: validCartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
      paymentMethod,
      shippingAddress: {
        houseNumber: userDoc.address.houseNumber,
        roadName: userDoc.address.roadName,
        city: userDoc.address.city,
        state: userDoc.address.state,
        zipCode: userDoc.address.zipCode,
      },
    });

    // Clear cart after order creation
    await Cart.findByIdAndDelete(cart._id);

    // Try to send notification, but don't make the order creation dependent on it
    try {
      // Find admin user to send notification
      const adminUser = await User.findOne({ role: 'admin' });
      console.log('Found admin user:', adminUser ? { 
        id: adminUser._id, 
        phone: adminUser.phone ? 'exists' : 'missing' 
      } : 'no admin found');
      
      if (adminUser?.phone) {
        // Send SMS notification to admin
        const message = `New order #${order._id.toString().slice(-6)} received! Amount: ₹${order.totalAmount}`;
        const result = await sendOTP(adminUser.phone, message);
        console.log('SMS notification result:', result);
        if (!result.success) {
          console.error('SMS notification failed:', result.error);
        }
      } else {
        console.error('Admin notification skipped: No admin phone number found');
      }
    } catch (error) {
      console.error('Failed to send admin notification:', error);
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .populate("items.productId");

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
