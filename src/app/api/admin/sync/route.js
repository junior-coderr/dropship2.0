import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/jwt";

// Helper function to verify admin role
const verifyAdmin = async (request) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== "admin") {
    return false;
  }

  return true;
};

export async function POST(request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const { products } = await request.json();

    // Batch update products
    const operations = products.map((product) => ({
      updateOne: {
        filter: { _id: product._id },
        update: { $set: product },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(operations);

    return NextResponse.json({
      success: true,
      message: "Products synced successfully",
      result,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
