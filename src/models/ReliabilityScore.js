const mongoose = require("mongoose");

const reliabilityScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

 score: {
  type: Number,
  min: 0,
  max: 100,
  default: null,
},

    completedTrips: {
      type: Number,
      min: 0,
      default: 0,
    },

    cancellations: {
      type: Number,
      min: 0,
      default: 0,
    },

    incidentReports: {
      type: Number,
      min: 0,
      default: 0,
    },

    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    lastCalculatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ReliabilityScore",
  reliabilityScoreSchema
);
