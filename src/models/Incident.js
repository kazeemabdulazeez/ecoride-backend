const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    tripSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TripSession",
      required: true,
      index: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "emergency",
        "accident",
        "safety",
        "medical",
        "vehicle_issue",
        "harassment",
        "other",
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      required: true,
    },

    latitude: {
      type: Number,
      min: -90,
      max: 90,
      default: null,
    },

    longitude: {
      type: Number,
      min: -180,
      max: 180,
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "dismissed"],
      default: "open",
      index: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolutionNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

incidentSchema.index({
  tripSession: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Incident", incidentSchema);
