import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/db/mongodb";

export async function verifyAuth(request = null) {
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
      return { user: null, error: "No token found" };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return { user: null, error: "User not found" };
    }

    return { user, error: null };
  } catch (error) {
    console.error("Auth error:", error);
    return { user: null, error: error.message };
  }
}

export async function isAdmin(request = null) {
  const { user, error } = await verifyAuth(request);
  
  if (error || !user) {
    return { user: null, error: error || "Authentication failed" };
  }

  if (user.role !== "admin") {
    return { user: null, error: "User is not an admin" };
  }

  return { user, error: null };
}
