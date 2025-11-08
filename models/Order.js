import mongoose from "mongoose";

const schema = new mongoose.Schema({
  shippingInfo: {
    hNo: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: Number, required: true },
    phoneNo: { type: Number, required: true },
  },

  // ✅ Flexible Order Items (Better!)
  orderItems: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      }
    }
  ],

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "Online", "Pay At Counter"],
    default: "Online",
  },

  paymentInfo: {
    id: String,
    status: String,
  },

  paidAt: Date,

  itemsPrice: {
    type: Number,
    default: 0,
  },

  taxPrice: {
    type: Number,
    default: 0,
  },

  shippingCharges: {
    type: Number,
    default: 0,
  },

  totalAmount: {
    type: Number,
    default: 0,
  },

  orderStatus: {
    type: String,
    enum: ["Preparing", "Shipped", "Delivered"],
    default: "Preparing",
  },

  deliveredAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.model("Order", schema);
