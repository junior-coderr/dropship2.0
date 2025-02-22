import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      phone: user.phone,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
