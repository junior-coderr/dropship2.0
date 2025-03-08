import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Support from "@/models/Support";
import { isAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    const { user, error } = await isAdmin(request);
    if (error || !user) {
      return NextResponse.json({ success: false, error: error || 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!['pending', 'in-progress', 'resolved'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectDB();
    const supportRequest = await Support.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!supportRequest) {
      return NextResponse.json(
        { success: false, error: 'Support request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, supportRequest });
  } catch (error) {
    console.error('Error updating support request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update support request' },
      { status: 500 }
    );
  }
}