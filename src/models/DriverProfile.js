const mongoose = require("mongoose");

const driverProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phoneNumber: {
      type: String,
      trim: true,
    },

    profilePhoto: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    vehicle: {
      make: {
        type: String,
        required: true,
        trim: true,
      },

      model: {
        type: String,
        required: true,
        trim: true,
      },

      year: {
        type: Number,
        required: true,
      },

      color: {
        type: String,
        required: true,
        trim: true,
      },

      plateNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
      },

      vehicleType: {
        type: String,
        enum: ["car", "suv", "van", "bus"],
        default: "car",
      },

      seats: {
        type: Number,
        required: true,
        min: 1,
      },
    },

    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      totalRatings: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    totalTrips: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DriverProfile", driverProfileSchema);