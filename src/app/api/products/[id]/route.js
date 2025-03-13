import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";
import mongoose from "mongoose";

// Function to generate random rating between 3.5 and 5.0
const generateRandomRating = () => {
  // Generate a number between 3.5 and 5.0
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  // Generate a random number of ratings between 10 and 500
  const ratingCount = Math.floor(Math.random() * 490 + 10);
  
  return { rating: parseFloat(rating), ratingCount };
};

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

    // Add random rating if it doesn't exist
    if (!productObj.rating || productObj.rating === 0) {
      const { rating, ratingCount } = generateRandomRating();
      productObj.rating = rating;
      productObj.ratingCount = ratingCount;
    }

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
