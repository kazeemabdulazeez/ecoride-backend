const mongoose = require("mongoose");
const TripSession = require("../models/TripSession");
const TripLocation = require("../models/TripLocation");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const getAuthorizedTrip = async (tripId, userId) => {
  if (!isValidObjectId(tripId)) {
    const error = new Error("Invalid trip session ID.");
    error.statusCode = 400;
    throw error;
  }

  const trip = await TripSession.findById(tripId);

  if (!trip) {
    const error = new Error("Trip session not found.");
    error.statusCode = 404;
    throw error;
  }

  const userIdString = userId.toString();

  const isParticipant =
    trip.driver.toString() === userIdString ||
    trip.passenger.toString() === userIdString;

  if (!isParticipant) {
    const error = new Error(
      "You are not authorized to access this trip location."
    );
    error.statusCode = 403;
    throw error;
  }

  return trip;
};

const updateTripLocation = async (req, res) => {
  try {
    const { tripId } = req.params;
    const {
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
    } = req.body;

    const trip = await getAuthorizedTrip(
      tripId,
      req.user._id
    );

    if (trip.status !== "started") {
      return res.status(409).json({
        message:
          "Location can only be updated while the trip is active.",
      });
    }

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        message:
          "latitude and longitude must be numbers.",
      });
    }

    const location = await TripLocation.create({
      tripSession: trip._id,
      recordedBy: req.user._id,
      latitude,
      longitude,
      accuracy:
        typeof accuracy === "number" ? accuracy : null,
      speed:
        typeof speed === "number" ? speed : null,
      heading:
        typeof heading === "number" ? heading : null,
    });

    return res.status(201).json({
      message: "Trip location updated successfully.",
      location,
    });
  } catch (error) {
    console.error("Update trip location error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to update trip location.",
    });
  }
};

const getTripLocations = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await getAuthorizedTrip(
      tripId,
      req.user._id
    );

    const locations = await TripLocation.find({
      tripSession: trip._id,
    })
      .populate(
        "recordedBy",
        "firstName lastName role"
      )
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      count: locations.length,
      locations,
    });
  } catch (error) {
    console.error("Get trip locations error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to get trip locations.",
    });
  }
};

const getLatestTripLocation = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await getAuthorizedTrip(
      tripId,
      req.user._id
    );

    const location = await TripLocation.findOne({
      tripSession: trip._id,
    })
      .populate(
        "recordedBy",
        "firstName lastName role"
      )
      .sort({ createdAt: -1 });

    if (!location) {
      return res.status(404).json({
        message: "No location has been recorded for this trip yet.",
      });
    }

    return res.status(200).json({
      location,
    });
  } catch (error) {
    console.error("Get latest trip location error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to get latest trip location.",
    });
  }
};

module.exports = {
  updateTripLocation,
  getTripLocations,
  getLatestTripLocation,
};
