const mongoose = require("mongoose");
const RecurringCommute = require("../models/RecurringCommute");
const { findMatchingCommutes } = require("../services/matchingService");

// Find compatible recurring commutes for the logged-in user
const getMatchingCommutes = async (req, res) => {
  try {
    const { commuteId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commuteId)) {
      return res.status(400).json({
        message: "Invalid recurring commute ID",
      });
    }

    const sourceCommute = await RecurringCommute.findOne({
      _id: commuteId,
      commuter: req.user._id,
    });

    if (!sourceCommute) {
      return res.status(404).json({
        message: "Recurring commute not found",
      });
    }

    if (sourceCommute.status !== "active") {
      return res.status(400).json({
        message: "Only active recurring commutes can be matched",
      });
    }

    const {
      routeRadiusKm,
      pickupRadiusKm,
      timeToleranceMinutes,
    } = req.query;

    const matches = await findMatchingCommutes(
      sourceCommute,
      req.user.role,
      {
        routeRadiusKm,
        pickupRadiusKm,
        timeToleranceMinutes,
      }
    );

    return res.status(200).json({
      count: matches.length,
      criteria: {
        routeRadiusKm: Number(routeRadiusKm) || 10,
        pickupRadiusKm: Number(pickupRadiusKm) || 2,
        timeToleranceMinutes:
          Number(timeToleranceMinutes) || 30,
      },
      matches,
    });
  } catch (error) {
    console.error("Get matching commutes error:", error.message);

    return res.status(500).json({
      message: "Server error while finding matching commutes",
    });
  }
};

module.exports = {
  getMatchingCommutes,
};