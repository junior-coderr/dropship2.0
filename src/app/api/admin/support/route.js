import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Support from "@/models/Support";
import { isAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    const { user, error } = await isAdmin(request);
    if (error || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const supportRequests = await Support.find().sort({ createdAt: -1 });

    return NextResponse.json({ success: true, supportRequests });
  } catch (error) {
    console.error('Error fetching support requests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch support requests' },
      { status: 500 }
    );
  }
}