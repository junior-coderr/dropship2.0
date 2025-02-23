import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Offer from "@/models/Offer";

export async function GET() {
  try {
    await connectDB();

    const activeOffer = await Offer.findOne({
      isActive: true,
      endTime: { $gt: new Date() },
    }).sort({ endTime: 1 });

    if (!activeOffer) {
      // Create a new 24-hour offer if none exists
      const newOffer = await Offer.create({
        name: "Daily Special",
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
      });

      return NextResponse.json({
        success: true,
        offer: newOffer,
      });
    }

    return NextResponse.json({
      success: true,
      offer: activeOffer,
    });
  } catch (error) {
    console.error("Error fetching active offer:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
