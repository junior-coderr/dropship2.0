import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending'
    },
    userId: {
      type: String,
      required: false, // Optional, as non-logged in users can also submit
    }
  },
  { timestamps: true }
);

export default mongoose.models.Support || mongoose.model("Support", supportSchema);