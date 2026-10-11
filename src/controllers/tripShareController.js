const crypto = require("crypto");
const mongoose = require("mongoose");

const TripShare = require("../models/TripShare");
const TripSession = require("../models/TripSession");
const TripLocation = require("../models/TripLocation");

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const createTripShare = async (req, res) => {
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

    // Only the passenger can create a trip-sharing link.
    if (trip.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the passenger can create a trip-sharing link.",
      });
    }

    if (["completed", "cancelled"].includes(trip.status)) {
      return res.status(409).json({
        message:
          "A trip-sharing link cannot be created for a completed or cancelled trip.",
      });
    }

    // Generate a cryptographically secure random token.
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash of the token.
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Share link expires in 24 hours.
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const share = await TripShare.create({
      tripSession: trip._id,
      createdBy: req.user._id,
      tokenHash,
      expiresAt,
    });

    const shareUrl = `/api/trip-shares/${rawToken}`;

    return res.status(201).json({
      message: "Trip-sharing link created successfully.",
      share: {
        id: share._id,
        tripSession: share.tripSession,
        expiresAt: share.expiresAt,
        shareUrl,
      },
    });
  } catch (error) {
    console.error("Create trip share error:", error);

    return res.status(500).json({
      message: "Failed to create trip-sharing link.",
    });
  }
};

const getSharedTrip = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token || token.length < 32) {
      return res.status(400).json({
        message: "Invalid sharing token.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const share = await TripShare.findOne({
      tokenHash,
    });

    if (!share) {
      return res.status(404).json({
        message: "Trip-sharing link not found or invalid.",
      });
    }

    if (share.revokedAt) {
      return res.status(410).json({
        message: "Trip-sharing link has been revoked.",
      });
    }

    if (share.expiresAt <= new Date()) {
      return res.status(410).json({
        message: "Trip-sharing link has expired.",
      });
    }

    const trip = await TripSession.findById(share.tripSession);

    if (!trip) {
      return res.status(404).json({
        message: "Trip session not found.",
      });
    }

    const latestLocation = await TripLocation.findOne({
      tripSession: trip._id,
    }).sort({ createdAt: -1 });

    // Only expose information needed for trip sharing.
    return res.status(200).json({
      trip: {
        id: trip._id,
        status: trip.status,
        startedAt: trip.startedAt,
        completedAt: trip.completedAt,
        latestLocation: latestLocation
          ? {
              latitude: latestLocation.latitude,
              longitude: latestLocation.longitude,
              accuracy: latestLocation.accuracy,
              speed: latestLocation.speed,
              heading: latestLocation.heading,
              recordedAt: latestLocation.createdAt,
            }
          : null,
      },
      share: {
        expiresAt: share.expiresAt,
      },
    });
  } catch (error) {
    console.error("Get shared trip error:", error);

    return res.status(500).json({
      message: "Failed to access shared trip.",
    });
  }
};

const revokeTripShare = async (req, res) => {
  try {
    const { shareId } = req.params;

    if (!isValidObjectId(shareId)) {
      return res.status(400).json({
        message: "Invalid trip-share ID.",
      });
    }

    const share = await TripShare.findById(shareId);

    if (!share) {
      return res.status(404).json({
        message: "Trip-sharing link not found.",
      });
    }

    // Only the passenger who created the share can revoke it.
    if (share.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to revoke this trip-sharing link.",
      });
    }

    if (share.revokedAt) {
      return res.status(409).json({
        message: "Trip-sharing link has already been revoked.",
      });
    }

    share.revokedAt = new Date();

    await share.save();

    return res.status(200).json({
      message: "Trip-sharing link revoked successfully.",
    });
  } catch (error) {
    console.error("Revoke trip share error:", error);

    return res.status(500).json({
      message: "Failed to revoke trip-sharing link.",
    });
  }
};

module.exports = {
  createTripShare,
  getSharedTrip,
  revokeTripShare,
};
