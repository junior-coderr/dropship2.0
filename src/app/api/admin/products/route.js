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
    const data = await request.json();

    const product = await Product.create(data);
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export async function GET(request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .select("name price images status"); // Only select needed fields

    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
