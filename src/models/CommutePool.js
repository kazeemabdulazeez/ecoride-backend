const mongoose = require("mongoose");

const commutePoolSchema = new mongoose.Schema(
  {
    recurringCommute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringCommute",
      required: true,
      unique: true,
      index: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    allocatedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },

    members: [
      {
        passenger: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        seats: {
          type: Number,
          required: true,
          min: 1,
        },

        joinedAt: {
          type: Date,
          default: Date.now,
        },

        status: {
          type: String,
          enum: ["active", "left"],
          default: "active",
        },
      },
    ],

    status: {
      type: String,
      enum: ["active", "paused", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

commutePoolSchema.virtual("availableSeats").get(function () {
  return this.totalSeats - this.allocatedSeats;
});

commutePoolSchema.set("toJSON", {
  virtuals: true,
});

commutePoolSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("CommutePool", commutePoolSchema);