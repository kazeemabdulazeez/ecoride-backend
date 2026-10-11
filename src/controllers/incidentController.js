const mongoose = require("mongoose");
const Incident = require("../models/Incident");
const TripSession = require("../models/TripSession");

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
      "You are not authorized to access this trip."
    );
    error.statusCode = 403;
    throw error;
  }

  return trip;
};

const reportIncident = async (req, res) => {
  try {
    const { tripId } = req.params;
    const {
      type,
      severity,
      description,
      latitude,
      longitude,
    } = req.body;

    const trip = await getAuthorizedTrip(
      tripId,
      req.user._id
    );

    if (["completed", "cancelled"].includes(trip.status)) {
      return res.status(409).json({
        message:
          "Incidents cannot be reported for a completed or cancelled trip.",
      });
    }

    if (!type || !description) {
      return res.status(400).json({
        message: "type and description are required.",
      });
    }

    if (
      latitude !== undefined &&
      (typeof latitude !== "number" ||
        latitude < -90 ||
        latitude > 90)
    ) {
      return res.status(400).json({
        message: "latitude must be a valid number between -90 and 90.",
      });
    }

    if (
      longitude !== undefined &&
      (typeof longitude !== "number" ||
        longitude < -180 ||
        longitude > 180)
    ) {
      return res.status(400).json({
        message:
          "longitude must be a valid number between -180 and 180.",
      });
    }

    const incident = await Incident.create({
      tripSession: trip._id,
      reportedBy: req.user._id,
      type,
      severity: severity || "medium",
      description,
      latitude:
        typeof latitude === "number" ? latitude : null,
      longitude:
        typeof longitude === "number" ? longitude : null,
    });

    const populatedIncident = await Incident.findById(
      incident._id
    )
      .populate(
        "reportedBy",
        "firstName lastName email role"
      )
      .populate("tripSession");

    return res.status(201).json({
      message: "Incident reported successfully.",
      incident: populatedIncident,
    });
  } catch (error) {
    console.error("Report incident error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to report incident.",
    });
  }
};

const getTripIncidents = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await getAuthorizedTrip(
      tripId,
      req.user._id
    );

    const incidents = await Incident.find({
      tripSession: trip._id,
    })
      .populate(
        "reportedBy",
        "firstName lastName role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    console.error("Get trip incidents error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to get trip incidents.",
    });
  }
};

const getIncident = async (req, res) => {
  try {
    const { incidentId } = req.params;

    if (!isValidObjectId(incidentId)) {
      return res.status(400).json({
        message: "Invalid incident ID.",
      });
    }

    const incident = await Incident.findById(incidentId)
      .populate(
        "reportedBy",
        "firstName lastName email role"
      )
      .populate("tripSession");

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found.",
      });
    }

    const trip = await getAuthorizedTrip(
      incident.tripSession._id,
      req.user._id
    );

    if (!trip) {
      return res.status(403).json({
        message: "You are not authorized to view this incident.",
      });
    }

    return res.status(200).json({
      incident,
    });
  } catch (error) {
    console.error("Get incident error:", error);

    return res.status(error.statusCode || 500).json({
      message:
        error.statusCode
          ? error.message
          : "Failed to get incident.",
    });
  }
};

module.exports = {
  reportIncident,
  getTripIncidents,
  getIncident,
};
