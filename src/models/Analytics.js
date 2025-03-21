import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    event: {
      type: String,
      required: true,
      enum: ["pageView", "click", "scroll", "engagement", "exit"],
    },
    page: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // duration in seconds
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Create compound indexes for faster queries
AnalyticsSchema.index({ userId: 1, event: 1, timestamp: 1 });
AnalyticsSchema.index({ page: 1, timestamp: 1 });

export default mongoose.models.Analytics ||
  mongoose.model("Analytics", AnalyticsSchema);
