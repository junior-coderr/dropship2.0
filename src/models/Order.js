import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "refunded"],
    default: "pending"
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  upiId: {
    type: String,
    required: true
  },
  refundAmount: {
    type: Number
  },
  refundedAt: {
    type: Date
  }
});

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
  size: String,
  color: String,
  returnRequest: returnRequestSchema
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cod"],
      default: "cod",
    },
    shippingAddress: {
      houseNumber: String,
      roadName: String,
      city: String,
      state: String,
      zipCode: String,
    },
    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

// Add a pre-save middleware to ensure totalAmount is always calculated correctly
orderSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }
  
  // If status is being updated to "delivered", set deliveredAt
  if (this.isModified("status") && this.status === "delivered" && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  next();
});

// Add method to calculate order total
orderSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

// Check if an item is eligible for return (7 days from delivery)
orderSchema.methods.isEligibleForReturn = function(itemId) {
  if (!this.deliveredAt || this.status !== "delivered") {
    return false;
  }
  
  const deliveredDate = new Date(this.deliveredAt);
  const currentDate = new Date();
  const daysSinceDelivery = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));
  
  return daysSinceDelivery <= 7;
};

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
