const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    pool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommutePool",
      required: true,
      index: true,
    },

    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple active booking requests
// from the same passenger for the same pool.
bookingSchema.index(
  { pool: 1, passenger: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "accepted"] },
    },
  }
);

module.exports = mongoose.model("Booking", bookingSchema);