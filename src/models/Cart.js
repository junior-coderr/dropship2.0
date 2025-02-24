import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
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
  size: String,
  color: String,
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.methods.getDisplayPrices = function () {
  const subtotal = this.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discount = subtotal * 0.3; // 30% discount
  const shippingOriginal = 40;
  const shippingDiscount = 40; // $40 off shipping
  const total = subtotal; // Actual total remains unchanged

  return {
    subtotal,
    discount,
    shippingOriginal,
    shippingDiscount,
    total,
    displayTotal: subtotal + shippingOriginal,
    currency: "₹",
  };
};

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
