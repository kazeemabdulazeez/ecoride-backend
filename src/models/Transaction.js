const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    booking: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Booking",
  default: null,
  index: true,
},

    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    payee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "booking_payment",
        "wallet_funding",
        "refund",
        "fare_adjustment",
      ],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "successful",
        "failed",
        "held",
        "released",
        "refunded",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    provider: {
      type: String,
      enum: ["paystack", "wallet", "system"],
      default: "paystack",
    },

    providerReference: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    paidAt: {
      type: Date,
      default: null,
    },

    heldAt: {
      type: Date,
      default: null,
    },

    releasedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);