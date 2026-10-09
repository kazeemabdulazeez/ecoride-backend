const mongoose = require("mongoose");
const ReliabilityScore = require("../models/ReliabilityScore");
const { calculateReliability } = require("../services/reliabilityService");

const getUserId = (user) => user?._id?.toString() || user?.id?.toString();

// Retrieve a user's reliability score.
const getReliabilityScore = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "A valid user ID is required.",
      });
    }

    let reliability = await ReliabilityScore.findOne({ user: userId });

    if (!reliability) {
      reliability = await calculateReliability(userId);
    }

    return res.status(200).json({
      success: true,
      data: reliability,
    });
  } catch (error) {
    console.error("Get reliability score error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve reliability score.",
    });
  }
};

// Recalculate only the authenticated user's score.
const refreshMyReliabilityScore = async (req, res) => {
  try {
    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const reliability = await calculateReliability(userId);

    return res.status(200).json({
      success: true,
      message: "Reliability score recalculated.",
      data: reliability,
    });
  } catch (error) {
    console.error("Refresh reliability score error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to recalculate reliability score.",
    });
  }
};

module.exports = {
  getReliabilityScore,
  refreshMyReliabilityScore,
};
