const mongoose = require("mongoose");
const TripSession = require("../models/TripSession");
const Booking = require("../models/Booking");
const CommutePool = require("../models/CommutePool");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createTripSession = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId || !isValidObjectId(bookingId)) {
      return res.status(400).json({
        message: "A valid bookingId is required.",
      });
    }

    const booking = await Booking.findById(bookingId).populate("pool");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.status !== "accepted") {
      return res.status(400).json({
        message: "A trip session can only be created from an accepted booking.",
      });
    }

    const pool = booking.pool;

    if (!pool) {
      return res.status(404).json({
        message: "Commute pool not found.",
      });
    }

    const isDriver =
      pool.driver.toString() === req.user._id.toString();

    const isPassenger =
      booking.passenger.toString() === req.user._id.toString();

    if (!isDriver && !isPassenger) {
      return res.status(403).json({
        message: "You are not authorized to create a trip session for this booking.",
      });
    }

    const existingTrip = await TripSession.findOne({
      booking: booking._id,
    });

    if (existingTrip) {
      return res.status(409).json({
        message: "A trip session already exists for this booking.",
        trip: existingTrip,
      });
    }

    const trip = await TripSession.create({
      booking: booking._id,
      pool: pool._id,
      driver: pool.driver,
      passenger: booking.passenger,
      status: "scheduled",
    });

    const populatedTrip = await TripSession.findById(trip._id)
      .populate("booking")
      .populate("driver", "firstName lastName email role")
      .populate("passenger", "firstName lastName email role")
      .populate("pool");

    return res.status(201).json({
      message: "Trip session created successfully.",
      trip: populatedTrip,
    });
  } catch (error) {
    console.error("Create trip session error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A trip session already exists for this booking.",
      });
    }

    return res.status(500).json({
      message: "Failed to create trip session.",
    });
  }
};

const getTripSession = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!isValidObjectId(tripId)) {
      return res.status(400).json({
        message: "Invalid trip session ID.",
      });
    }

    const trip = await TripSession.findById(tripId)
      .populate("booking")
      .populate("driver", "firstName lastName email role")
      .populate("passenger", "firstName lastName email role")
      .populate("pool");

    if (!trip) {
      return res.status(404).json({
        message: "Trip session not found.",
      });
    }

    const userId = req.user._id.toString();

    const isParticipant =
      trip.driver._id.toString() === userId ||
      trip.passenger._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not authorized to view this trip.",
      });
    }

    return res.status(200).json({
      trip,
    });
  } catch (error) {
    console.error("Get trip session error:", error);

    return res.status(500).json({
      message: "Failed to get trip session.",
    });
  }
};

const startTripSession = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!isValidObjectId(tripId)) {
      return res.status(400).json({
        message: "Invalid trip session ID.",
      });
    }

    const trip = await TripSession.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip session not found.",
      });
    }

    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the trip driver can start the trip.",
      });
    }

    if (trip.status !== "scheduled") {
      return res.status(409).json({
        message: `Trip cannot be started because it is already ${trip.status}.`,
      });
    }

    trip.status = "started";
    trip.startedAt = new Date();

    await trip.save();

    return res.status(200).json({
      message: "Trip started successfully.",
      trip,
    });
  } catch (error) {
    console.error("Start trip session error:", error);

    return res.status(500).json({
      message: "Failed to start trip.",
    });
  }
};

const completeTripSession = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!isValidObjectId(tripId)) {
      return res.status(400).json({
        message: "Invalid trip session ID.",
      });
    }

    const trip = await TripSession.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip session not found.",
      });
    }

    if (trip.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the trip driver can complete the trip.",
      });
    }

    if (trip.status !== "started") {
      return res.status(409).json({
        message: "Only a started trip can be completed.",
      });
    }

    trip.status = "completed";
    trip.completedAt = new Date();

    await trip.save();

    return res.status(200).json({
      message: "Trip completed successfully.",
      trip,
    });
  } catch (error) {
    console.error("Complete trip session error:", error);

    return res.status(500).json({
      message: "Failed to complete trip.",
    });
  }
};

const cancelTripSession = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(tripId)) {
      return res.status(400).json({
        message: "Invalid trip session ID.",
      });
    }

    const trip = await TripSession.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        message: "Trip session not found.",
      });
    }

    const userId = req.user._id.toString();

    const isParticipant =
      trip.driver.toString() === userId ||
      trip.passenger.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not authorized to cancel this trip.",
      });
    }

    if (["completed", "cancelled"].includes(trip.status)) {
      return res.status(409).json({
        message: `Trip cannot be cancelled because it is already ${trip.status}.`,
      });
    }

    trip.status = "cancelled";
    trip.cancelledAt = new Date();
    trip.cancellationReason = reason || null;

    await trip.save();

    return res.status(200).json({
      message: "Trip cancelled successfully.",
      trip,
    });
  } catch (error) {
    console.error("Cancel trip session error:", error);

    return res.status(500).json({
      message: "Failed to cancel trip.",
    });
  }
};

module.exports = {
  createTripSession,
  getTripSession,
  startTripSession,
  completeTripSession,
  cancelTripSession,
};
