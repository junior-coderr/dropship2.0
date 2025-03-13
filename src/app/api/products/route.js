import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";

// Function to generate random rating between 3.5 and 5.0
const generateRandomRating = () => {
  // Generate a number between 3.5 and 5.0
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
  // Generate a random number of ratings between 10 and 500
  const ratingCount = Math.floor(Math.random() * 490 + 10);
  
  return { rating: parseFloat(rating), ratingCount };
};

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
      .select("name description price images video status rating ratingCount") // Added rating fields
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Generate random ratings for products that don't have them
    const productsWithRatings = products.map(product => {
      if (!product.rating || product.rating === 0) {
        const { rating, ratingCount } = generateRandomRating();
        return {
          ...product,
          rating,
          ratingCount
        };
      }
      return product;
    });

    return NextResponse.json({
      success: true,
      products: productsWithRatings,
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
