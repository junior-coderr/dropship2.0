import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 12;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    await connectDB();

    // Build query
    const query = {
      status: "published", // Only fetch published products
    };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents for pagination
    const total = await Product.countDocuments(query);

    // Fetch products with pagination
    const products = await Product.find(query)
      .select("name description price images status") // Select only needed fields
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Use lean() for better performance

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
