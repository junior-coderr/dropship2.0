import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Product from "@/models/Product";
import { verifyToken } from "@/lib/jwt";
import { deleteFromAzure } from "@/lib/azure";

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

export async function PUT(request, { params }) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const id = params.id;
    const data = await request.json();

    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Verify admin
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Find product and delete associated images
    const p = await params;
    const id = p.id;
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete images from storage
    for (const image of product.images) {
      if (image.filename) {
        await deleteFromAzure(image.filename);
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    const p = await params;
    const id = p.id;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
