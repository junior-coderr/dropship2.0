import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { verifyAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    let cart = await Cart.findOne({ userId: user.id });
    if (!cart) {
      cart = new Cart({ userId: user.id, items: [] });
    }

    // Check if product exists and is in stock
    const product = await Product.findById(data.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.inStock) {
      return NextResponse.json({ error: "Product out of stock" }, { status: 400 });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === data.productId &&
        item.size === data.size &&
        item.color === data.color
    );

    if (existingItemIndex > -1) {
      // Update quantity if product exists
      cart.items[existingItemIndex].quantity += data.quantity || 1;
    } else {
      // Add new item if product doesn't exist in cart
      cart.items.push({
        productId: data.productId,
        quantity: data.quantity || 1,
        price: product.price,
        size: data.size,
        color: data.color,
      });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.productId"
    );

    return NextResponse.json({ success: true, cart: populatedCart });
  } catch (error) {
    console.error("Cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: user.id }).populate(
      "items.productId"
    );

    return NextResponse.json({
      success: true,
      cart: cart || { userId: user.id, items: [] },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { user, error } = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const size = searchParams.get("size");
    const color = searchParams.get("color");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const cart = await Cart.findOne({ userId: user.id });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Remove item that matches productId, size, and color
    cart.items = cart.items.filter((item) => {
      const sizeMatch = size ? item.size === size : true;
      const colorMatch = color ? item.color === color : true;
      return item.productId.toString() !== productId || !sizeMatch || !colorMatch;
    });
    
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate("items.productId");

    return NextResponse.json({ success: true, cart: updatedCart });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to remove item" },
      { status: 500 }
    );
  }
}
