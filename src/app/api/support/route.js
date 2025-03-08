import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Support from "@/models/Support";
import { verifyAuth } from "@/lib/auth";

export async function POST(request) {
  try {
    await connectDB();
    
    // Try to get user if they're logged in, but don't require it
    const { user } = await verifyAuth(request);
    
    const data = await request.json();
    const { name, email, subject, message } = data;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const support = await Support.create({
      name,
      email,
      subject,
      message,
      userId: user?.id || null
    });

    return NextResponse.json({ success: true, support });
  } catch (error) {
    console.error("Support error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit support request" },
      { status: 500 }
    );
  }
}