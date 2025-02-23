import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Cart from "@/models/Cart";
import { verifyToken } from "@/lib/jwt";

// Helper to verify authentication
const verifyAuth = (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return verifyToken(token);
};

export async function PUT(request) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { productId, quantity, size, color } = await request.json();

    const cart = await Cart.findOne({ userId: user.id });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Find the item and update its quantity
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      await cart.populate("items.productId");

      return NextResponse.json({
        success: true,
        cart,
      });
    }

    return NextResponse.json(
      {
        error: "Item not found in cart",
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}
