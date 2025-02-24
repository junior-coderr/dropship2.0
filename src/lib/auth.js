import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db/mongodb";

export async function isAdmin(request = null) {
  try {
    await connectDB();

    // Try to get token from Authorization header if request is provided
    let token;
    if (request) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    // If no token in header, try cookies
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get("auth_token")?.value;
    }

    if (!token) {
      return false;
    }

    // Use decoded.userId instead of decoded.id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // Changed from decoded.id to decoded.userId

    if (!user || user.role !== "admin") {
      return false;
    }

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return false;
  }
}
