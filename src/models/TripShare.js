const mongoose = require("mongoose");

const tripShareSchema = new mongoose.Schema(
  {
    tripSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripSession",
      required: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

tripShareSchema.index({
  tripSession: 1,
  createdAt: -1,
});

module.exports = mongoose.model("TripShare", tripShareSchema);
