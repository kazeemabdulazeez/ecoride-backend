const DriverProfile = require("../models/DriverProfile");
const User = require("../models/User");

// Create or update driver profile
const createOrUpdateDriverProfile = async (req, res) => {
  try {
    const {
      phoneNumber,
      profilePhoto,
      bio,
      vehicle,
    } = req.body;

    // Make sure the logged-in user is a driver
    if (req.user.role !== "driver") {
      return res.status(403).json({
        message: "Only drivers can create a driver profile",
      });
    }

    // Check if a driver profile already exists
    let driverProfile = await DriverProfile.findOne({
      user: req.user._id,
    });

    if (driverProfile) {
      // Update existing profile
      driverProfile.phoneNumber = phoneNumber ?? driverProfile.phoneNumber;
      driverProfile.profilePhoto = profilePhoto ?? driverProfile.profilePhoto;
      driverProfile.bio = bio ?? driverProfile.bio;

      if (vehicle) {
        driverProfile.vehicle = {
          ...driverProfile.vehicle.toObject(),
          ...vehicle,
        };
      }

      await driverProfile.save();

      return res.status(200).json({
        message: "Driver profile updated successfully",
        driverProfile,
      });
    }

    // Create new profile
    if (
      !vehicle ||
      !vehicle.make ||
      !vehicle.model ||
      !vehicle.year ||
      !vehicle.color ||
      !vehicle.plateNumber ||
      !vehicle.seats
    ) {
      return res.status(400).json({
        message: "Complete vehicle information is required",
      });
    }

    driverProfile = await DriverProfile.create({
      user: req.user._id,
      phoneNumber,
      profilePhoto,
      bio,
      vehicle,
    });

    res.status(201).json({
      message: "Driver profile created successfully",
      driverProfile,
    });
  } catch (error) {
    console.error("Driver profile error:", error.message);

    res.status(500).json({
      message: "Server error while saving driver profile",
    });
  }
};

// Get current driver's profile
const getDriverProfile = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        message: "Only drivers can access a driver profile",
      });
    }

    const driverProfile = await DriverProfile.findOne({
      user: req.user._id,
    }).populate("user", "firstName lastName email verificationStatus");

    if (!driverProfile) {
      return res.status(404).json({
        message: "Driver profile not found",
      });
    }

    res.status(200).json({
      driverProfile,
    });
  } catch (error) {
    console.error("Get driver profile error:", error.message);

    res.status(500).json({
      message: "Server error while retrieving driver profile",
    });
  }
};

module.exports = {
  createOrUpdateDriverProfile,
  getDriverProfile,
};