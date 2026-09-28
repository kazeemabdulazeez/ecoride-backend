const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    verificationType: {
      type: String,
      enum: ["identity", "driver", "vehicle"],
      required: true,
    },

    documentType: {
      type: String,
      required: true,
      trim: true,
    },

    documentNumber: {
      type: String,
      required: true,
      trim: true,
    },

    documentUrl: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Verification", verificationSchema);