const RecurringCommute = require("../models/RecurringCommute");
const {
  createNotification,
} = require("../services/notificationService");

// Create recurring commute
const createRecurringCommute = async (req, res) => {
  try {
    const {
      route,
      schedule,
      pickupPoints,
      preferences,
    } = req.body;

    if (!route?.origin || !route?.destination) {
      return res.status(400).json({
        message: "Origin and destination are required",
      });
    }

    if (
      route.origin.latitude === undefined ||
      route.origin.longitude === undefined ||
      route.destination.latitude === undefined ||
      route.destination.longitude === undefined
    ) {
      return res.status(400).json({
        message: "Origin and destination coordinates are required",
      });
    }

    if (!schedule?.days?.length || !schedule?.departureTime) {
      return res.status(400).json({
        message: "Schedule days and departure time are required",
      });
    }

    if (!pickupPoints || pickupPoints.length === 0) {
      return res.status(400).json({
        message: "At least one pickup point is required",
      });
    }

    const commute = await RecurringCommute.create({
      commuter: req.user._id,
      route,
      schedule,
      pickupPoints,
      preferences,
    });

    res.status(201).json({
      message: "Recurring commute created successfully",
      commute,
    });
  } catch (error) {
    console.error("Create recurring commute error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid recurring commute data",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    return res.status(500).json({
      message: "Server error while creating recurring commute",
    });
  }
};

// Get current user's recurring commutes
const getMyRecurringCommutes = async (req, res) => {
  try {
    const commutes = await RecurringCommute.find({
      commuter: req.user._id,
      status: { $ne: "cancelled" },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: commutes.length,
      commutes,
    });
  } catch (error) {
    console.error("Get recurring commutes error:", error.message);

    res.status(500).json({
      message: "Server error while retrieving recurring commutes",
    });
  }
};

// Get one recurring commute
const getRecurringCommuteById = async (req, res) => {
  try {
    const commute = await RecurringCommute.findOne({
      _id: req.params.id,
      commuter: req.user._id,
    });

    if (!commute) {
      return res.status(404).json({
        message: "Recurring commute not found",
      });
    }

    res.status(200).json({
      commute,
    });
  } catch (error) {
    console.error("Get recurring commute error:", error.message);

    res.status(500).json({
      message: "Server error while retrieving recurring commute",
    });
  }
};

// Update recurring commute
const updateRecurringCommute = async (req, res) => {
  try {
    const commute = await RecurringCommute.findOne({
      _id: req.params.id,
      commuter: req.user._id,
    });

    if (!commute) {
      return res.status(404).json({
        message: "Recurring commute not found",
      });
    }

    const body = req.body || {};
    const scheduleChanged = body.schedule !== undefined;

    const allowedFields = [
      "route",
      "schedule",
      "pickupPoints",
      "preferences",
      "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        commute[field] = body[field];
      }
    }

    await commute.save();

    if (scheduleChanged) {
      await createNotification({
        recipient: commute.commuter,
        type: "schedule_change",
        title: "Commute schedule updated",
        message:
          "Your recurring commute schedule has been updated successfully.",
      });
    }

    res.status(200).json({
      message: "Recurring commute updated successfully",
      commute,
    });
  } catch (error) {
    console.error("Update recurring commute error:", error.message);

    res.status(500).json({
      message: "Server error while updating recurring commute",
    });
  }
};

// Pause recurring commute
const pauseRecurringCommute = async (req, res) => {
  try {
    const commute = await RecurringCommute.findOneAndUpdate(
      {
        _id: req.params.id,
        commuter: req.user._id,
      },
      {
        status: "paused",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!commute) {
      return res.status(404).json({
        message: "Recurring commute not found",
      });
    }

    res.status(200).json({
      message: "Recurring commute paused successfully",
      commute,
    });
  } catch (error) {
    console.error("Pause recurring commute error:", error.message);

    res.status(500).json({
      message: "Server error while pausing recurring commute",
    });
  }
};

// Cancel recurring commute
const cancelRecurringCommute = async (req, res) => {
  try {
    const commute = await RecurringCommute.findOneAndUpdate(
      {
        _id: req.params.id,
        commuter: req.user._id,
      },
      {
        status: "cancelled",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!commute) {
      return res.status(404).json({
        message: "Recurring commute not found",
      });
    }

    res.status(200).json({
      message: "Recurring commute cancelled successfully",
      commute,
    });
  } catch (error) {
    console.error("Cancel recurring commute error:", error.message);

    res.status(500).json({
      message: "Server error while cancelling recurring commute",
    });
  }
};

module.exports = {
  createRecurringCommute,
  getMyRecurringCommutes,
  getRecurringCommuteById,
  updateRecurringCommute,
  pauseRecurringCommute,
  cancelRecurringCommute,
};