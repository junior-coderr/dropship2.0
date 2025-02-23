import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
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

// GET cart items
export async function GET(request) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: user.id }).populate(
      "items.productId"
    );

    return NextResponse.json({
      success: true,
      cart: cart || { items: [] },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add/Update cart item
export async function POST(request) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const {
      productId,
      quantity,
      size = null,
      color = null,
    } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate product exists and get its price
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: user.id });
    if (!cart) {
      cart = new Cart({ userId: user.id, items: [] });
    }

    // Find existing item with matching productId, size, and color
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        quantity,
        size,
        color,
        price: product.price,
      });
    }

    await cart.save();

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error("Cart API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process cart operation",
      },
      { status: 500 }
    );
  }
}

// Remove cart item
export async function DELETE(request) {
  try {
    const user = verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const size = searchParams.get("size") || null;
    const color = searchParams.get("color") || null;

    const cart = await Cart.findOne({ userId: user.id });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
        )
    );

    await cart.save();

    // Return populated cart data
    await cart.populate("items.productId");
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
