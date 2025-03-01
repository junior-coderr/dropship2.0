import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";
import { isAdmin } from "@/lib/auth";

export async function GET(request, context) {
  try {
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await context.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request, context) {
  try {
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = context.params;
    const data = await request.json();

    // Don't allow role updates if trying to demote the last admin
    if (data.role === "user") {
      const adminCount = await User.countDocuments({ role: "admin" });
      const currentUser = await User.findById(id);

      if (adminCount === 1 && currentUser.role === "admin") {
        return NextResponse.json(
          { success: false, error: "Cannot demote the last admin user" },
          { status: 400 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    const adminUser = await isAdmin(request);
    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = context.params;

    // Prevent deleting the last admin
    const adminCount = await User.countDocuments({ role: "admin" });
    const userToDelete = await User.findById(id);

    if (!userToDelete) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (adminCount === 1 && userToDelete.role === "admin") {
      return NextResponse.json(
        { success: false, error: "Cannot delete the last admin user" },
        { status: 400 }
      );
    }

    // Make sure admin can't delete themselves
    if (adminUser.id === id) {
      return NextResponse.json(
        { success: false, error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
