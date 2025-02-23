import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    // Find user and check for address
    const user = await User.findById(decoded.id).select("shippingAddress");

    const hasAddress = Boolean(
      user?.shippingAddress?.address1 &&
        user?.shippingAddress?.city &&
        user?.shippingAddress?.state &&
        user?.shippingAddress?.zipCode
    );
    console.log("hasAddress", hasAddress);

    return NextResponse.json({
      success: true,
      hasAddress,
    });
  } catch (error) {
    console.error("Check address error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
