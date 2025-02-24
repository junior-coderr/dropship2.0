import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(request, context) {
  try {
    const { id } = await context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findOne({
      _id: id,
      status: "published",
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Transform MongoDB document to plain object safely
    const productObj = product.toObject();
    const productData = {
      ...productObj,
      _id: productObj._id.toString(),
      createdAt: productObj.createdAt
        ? new Date(productObj.createdAt).toISOString()
        : null,
      updatedAt: productObj.updatedAt
        ? new Date(productObj.updatedAt).toISOString()
        : null,
    };

    return NextResponse.json({
      success: true,
      product: productData,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
