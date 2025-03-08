import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Cart from "@/models/Cart";
import { verifyAuth } from "@/lib/auth";

// Handler function to avoid code duplication
async function handleUpdateQuantity(request) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { productId, quantity, size, color } = data;

    if (!productId || typeof quantity !== 'number') {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: user.id });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item) => 
        item.productId.toString() === productId && 
        item.size === size && 
        item.color === color
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((_, index) => index !== itemIndex);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate("items.productId");
    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to update quantity" },
      { status: 500 }
    );
  }
}

export const PATCH = handleUpdateQuantity;
export const PUT = handleUpdateQuantity;
