import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    video: {
      url: String,
      alt: String,
      filename: String,
    },
    sizeType: {
      type: String,
      enum: ["free", "custom"],
      default: "free",
    },
    sizes: [
      {
        type: String,
      },
    ],
    hasColors: {
      type: Boolean,
      default: false,
    },
    colors: [
      {
        name: String,
        code: String,
      },
    ],
    bulletPoints: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      default: "uncategorized",
    },
    features: [
      {
        type: String,
      },
    ],
    isNewProduct: {
      // Renamed from isNew to avoid conflicts
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true, // Add this to suppress the warning
  }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
