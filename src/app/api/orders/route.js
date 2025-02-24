import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { verifyToken } from "@/lib/jwt";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import User from "@/models/User";

// Helper to verify authentication
const verifyAuth = (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return verifyToken(token);
};

export async function POST(request) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Create order from cart
    const { paymentMethod } = await request.json();

    const order = await Order.create({
      userId: user.id,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
      })),
      totalAmount: cart.items.reduce(
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
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
