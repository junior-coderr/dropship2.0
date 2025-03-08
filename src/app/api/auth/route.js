import { NextResponse } from "next/server";
import { generateOTP, sendOTP, validateOTP } from "@/lib/twilio";
import { generateToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { isAdmin } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { action, phone, otp, name } = body;

    switch (action) {
      case "send-otp": {
        // First check if user exists
        const existingUser = await User.findOne({ phone });
        const generatedOtp = generateOTP();
        const twilioResponse = await sendOTP(phone, generatedOtp);

        if (!twilioResponse.success) {
          return NextResponse.json(
            { success: false, message: "Failed to send OTP" },
            { status: 500 }
          );
        }

        // Store OTP in MongoDB with user status
        await OTP.findOneAndUpdate(
          { phone },
          {
            phone,
            otp: generatedOtp,
            isNewUser: !existingUser,
          },
          { upsert: true, new: true }
        );

        return NextResponse.json({
          success: true,
          message: "OTP sent successfully",
          isNewUser: !existingUser,
        });
      }

      case "verify-otp": {
        const otpDoc = await OTP.findOne({ phone });

        if (!otpDoc) {
          return NextResponse.json(
            { success: false, message: "Please request a new OTP" },
            { status: 400 }
          );
        }

        if (!validateOTP(otpDoc.otp, otp)) {
          // Increment attempts
          otpDoc.attempts += 1;
          await otpDoc.save();

          if (otpDoc.attempts >= 3) {
            await OTP.deleteOne({ phone });
            return NextResponse.json(
              {
                success: false,
                message: "Too many attempts. Please request a new OTP",
              },
              { status: 400 }
            );
          }

          return NextResponse.json(
            { success: false, message: "Invalid OTP" },
            { status: 400 }
          );
        }

        // If OTP is valid, check if user exists
        const existingUser = await User.findOne({ phone });
        await OTP.deleteOne({ phone });

        if (existingUser) {
          existingUser.lastLogin = new Date();
          await existingUser.save();

          const token = generateToken(existingUser);

          return NextResponse.json({
            success: true,
            user: existingUser,
            token,
            isNewUser: false,
          });
        }

        return NextResponse.json({
          success: true,
          isNewUser: true,
        });
      }

      case "register": {
        if (!name || !phone) {
          return NextResponse.json(
            { success: false, message: "Name and phone are required" },
            { status: 400 }
          );
        }

        // Set as admin if it's the first user, otherwise regular user
        const userCount = await User.countDocuments({});
        const role = userCount === 0 ? "admin" : "user";

        const newUser = await User.create({
          phone,
          name,
          role, // Add role field here
          isVerified: true,
          lastLogin: new Date(),
        });

        const token = generateToken(newUser);

        return NextResponse.json({
          success: true,
          user: newUser,
          token,
        });
      }

      default:
        return NextResponse.json(
          { success: false, message: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Auth API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { user, error } = await isAdmin(request);
    
    if (!user) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    // Remove sensitive data before sending
    const { password, ...userData } = user.toObject();
    
    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Auth validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
