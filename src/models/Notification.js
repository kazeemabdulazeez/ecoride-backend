const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "trip_reminder",
        "schedule_change",
        "driver_change",
        "pool_change",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    scheduledTrip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ScheduledTrip",
      default: null,
      index: true,
    },

    dedupeKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);