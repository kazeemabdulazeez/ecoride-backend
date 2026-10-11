const mongoose = require("mongoose");

const scheduledTripSchema = new mongoose.Schema(
  {
    recurringCommute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringCommute",
      required: true,
      index: true,
    },

    pool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommutePool",
      required: true,
      index: true,
    },

    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },

    reminderSentAt: {
      type: Date,
      default: null,
    },

    changeNotificationSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One occurrence per recurring commute and scheduled date/time.
scheduledTripSchema.index(
  { recurringCommute: 1, scheduledFor: 1 },
  { unique: true }
);

module.exports = mongoose.model("ScheduledTrip", scheduledTripSchema);
