
const mongoose = require("mongoose");
const IncidentReport = require("../models/IncidentReport");
const CommutePool = require("../models/CommutePool");

const getUserId = (user) => user?._id?.toString() || user?.id?.toString();

const createIncidentReport = async (req, res) => {
  try {
    const reporterId = getUserId(req.user);
    const {
      pool: poolId,
      reportedUser: reportedUserId,
      type,
      description,
    } = req.body;

    if (!reporterId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !mongoose.isValidObjectId(poolId) ||
      !mongoose.isValidObjectId(reportedUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid pool and reported-user IDs are required.",
      });
    }

    const allowedTypes = [
      "unsafe_driving",
      "harassment",
      "misconduct",
      "lateness",
      "no_show",
      "vehicle_issue",
      "other",
    ];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid incident type.",
      });
    }

    if (
      typeof description !== "string" ||
      description.trim().length < 10 ||
      description.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must contain 10–2000 characters.",
      });
    }

    if (reporterId === reportedUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself.",
      });
    }

    const pool = await CommutePool.findById(poolId);

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "Commute pool not found.",
      });
    }

    const activeMemberIds = (pool.members || [])
      .filter((member) => member.status === "active")
      .map((member) => member.passenger?.toString())
      .filter(Boolean);

    const participants = new Set([
      pool.driver.toString(),
      ...activeMemberIds,
    ]);

    if (
      !participants.has(reporterId) ||
      !participants.has(reportedUserId)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Both users must be the driver or an active passenger in this commute pool.",
      });
    }

    const report = await IncidentReport.create({
      pool: pool._id,
      reporter: reporterId,
      reportedUser: reportedUserId,
      type,
      description: description.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Incident report submitted successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Create incident report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit incident report.",
    });
  }
};

const getMyIncidentReports = async (req, res) => {
  try {
    const reporterId = getUserId(req.user);

    if (!reporterId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const reports = await IncidentReport.find({ reporter: reporterId })
      .populate("reportedUser", "firstName lastName")
      .populate("pool")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Get incident reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve incident reports.",
    });
  }
};

module.exports = {
  createIncidentReport,
  getMyIncidentReports,
};
