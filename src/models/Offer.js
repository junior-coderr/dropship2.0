import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Offer || mongoose.model("Offer", offerSchema);
