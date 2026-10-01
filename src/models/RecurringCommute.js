const mongoose = require("mongoose");

const recurringCommuteSchema = new mongoose.Schema(
  {
    commuter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    route: {
      origin: {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
      },

      destination: {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
      },
    },

    schedule: {
      days: {
        type: [
          {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
        ],
        required: true,
        validate: {
          validator: (days) => days.length > 0,
          message: "At least one commute day is required",
        },
      },

      departureTime: {
        type: String,
        required: true,
        match: [
          /^([01]\d|2[0-3]):([0-5]\d)$/,
          "Departure time must use HH:mm format",
        ],
      },
    },

    pickupPoints: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90,
        },

        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180,
        },
      },
    ],

    preferences: {
      seatsNeeded: {
        type: Number,
        default: 1,
        min: 1,
        max: 10,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },

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

module.exports = mongoose.model(
  "RecurringCommute",
  recurringCommuteSchema
);