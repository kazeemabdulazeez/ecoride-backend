const mongoose = require("mongoose");
const CommutePool = require("../models/CommutePool");
const RecurringCommute = require("../models/RecurringCommute");
const DriverProfile = require("../models/DriverProfile");
const {
  createNotification,
} = require("../services/notificationService");

// Notify users affected by a pool change
const notifyPoolChange = async (
  pool,
  message,
  eventId,
  additionalRecipients = []
) => {
  try {
    const recipientIds = new Set();

    if (pool.driver) {
      recipientIds.add(pool.driver.toString());
    }

    for (const member of pool.members || []) {
      if (member.status === "active" && member.passenger) {
        recipientIds.add(member.passenger.toString());
      }
    }

    for (const recipient of additionalRecipients) {
      if (recipient) {
        recipientIds.add(recipient.toString());
      }
    }

    for (const recipient of recipientIds) {
      await createNotification({
        recipient,
        type: "pool_change",
        title: "Commute pool updated",
        message,
        dedupeKey: `pool_change:${pool._id}:${eventId}:${recipient}`,
      });
    }
  } catch (error) {
    console.error("Pool change notification error:", error.message);
  }
};

// Create commute pool
const createCommutePool = async (req, res) => {
  try {
    if (req.user.role !== "driver") {
      return res.status(403).json({
        message: "Only drivers can create a commute pool.",
      });
    }

    const { recurringCommuteId } = req.body;

    if (!recurringCommuteId) {
      return res.status(400).json({
        message: "recurringCommuteId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(recurringCommuteId)) {
      return res.status(400).json({
        message: "Invalid recurring commute ID.",
      });
    }

    const recurringCommute = await RecurringCommute.findOne({
      _id: recurringCommuteId,
      commuter: req.user._id,
    });

    if (!recurringCommute) {
      return res.status(404).json({
        message: "Recurring commute not found or does not belong to you.",
      });
    }

    if (recurringCommute.status !== "active") {
      return res.status(400).json({
        message: "Only active recurring commutes can have a pool.",
      });
    }

    const existingPool = await CommutePool.findOne({
      recurringCommute: recurringCommuteId,
    });

    if (existingPool) {
      return res.status(409).json({
        message: "A commute pool already exists for this recurring commute.",
      });
    }

    const driverProfile = await DriverProfile.findOne({
      user: req.user._id,
    });

    if (!driverProfile) {
      return res.status(400).json({
        message: "Driver profile is required before creating a commute pool.",
      });
    }

    const totalSeats = driverProfile.vehicle.seats;

    const pool = await CommutePool.create({
      recurringCommute: recurringCommuteId,
      driver: req.user._id,
      totalSeats,
      allocatedSeats: 0,
      members: [],
      status: "active",
    });

    const populatedPool = await CommutePool.findById(pool._id)
      .populate("driver", "firstName lastName email role")
      .populate("recurringCommute");

    return res.status(201).json({
      message: "Commute pool created successfully.",
      pool: populatedPool,
    });
  } catch (error) {
    console.error("Create commute pool error:", error);

    return res.status(500).json({
      message: "Failed to create commute pool.",
      error: error.message,
    });
  }
};

// Join commute pool
const joinCommutePool = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { poolId } = req.params;
    const { seats = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(poolId)) {
      return res.status(400).json({
        message: "Invalid commute pool ID.",
      });
    }

    if (req.user.role !== "passenger") {
      return res.status(403).json({
        message: "Only passengers can join a commute pool.",
      });
    }

    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({
        message: "Seats must be a positive whole number.",
      });
    }

    let joinedPool;

    await session.withTransaction(async () => {
      const pool = await CommutePool.findById(poolId).session(session);

      if (!pool) {
        const error = new Error("Commute pool not found.");
        error.statusCode = 404;
        throw error;
      }

      if (pool.status !== "active") {
        const error = new Error(
          "Passengers can only join an active commute pool."
        );
        error.statusCode = 400;
        throw error;
      }

      const existingMember = pool.members.find(
        (member) =>
          member.passenger.toString() === req.user._id.toString() &&
          member.status === "active"
      );

      if (existingMember) {
        const error = new Error(
          "You are already an active member of this commute pool."
        );
        error.statusCode = 409;
        throw error;
      }

      const availableSeats = pool.totalSeats - pool.allocatedSeats;

      if (seats > availableSeats) {
        const error = new Error(
          `Not enough seats available. Only ${availableSeats} seat(s) remain.`
        );
        error.statusCode = 409;
        throw error;
      }

      pool.members.push({
        passenger: req.user._id,
        seats,
        joinedAt: new Date(),
        status: "active",
      });

      pool.allocatedSeats += seats;

      await pool.save({ session });

      joinedPool = pool;
    });

    await notifyPoolChange(
      joinedPool,
      `A passenger joined your commute pool and booked ${seats} seat(s).`,
      `join:${req.user._id}:${joinedPool.updatedAt.getTime()}`,
      [req.user._id]
    );

    const populatedPool = await CommutePool.findById(joinedPool._id)
      .populate("driver", "firstName lastName email role")
      .populate("members.passenger", "firstName lastName email role")
      .populate("recurringCommute");

    return res.status(200).json({
      message: "Joined commute pool successfully.",
      pool: populatedPool,
    });
  } catch (error) {
    console.error("Join commute pool error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Failed to join commute pool.",
    });
  } finally {
    await session.endSession();
  }
};

// Get commute pool
const getCommutePool = async (req, res) => {
  try {
    const { poolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(poolId)) {
      return res.status(400).json({
        message: "Invalid commute pool ID.",
      });
    }

    const pool = await CommutePool.findById(poolId)
      .populate("driver", "firstName lastName email role")
      .populate("members.passenger", "firstName lastName email role")
      .populate("recurringCommute");

    if (!pool) {
      return res.status(404).json({
        message: "Commute pool not found.",
      });
    }

    return res.status(200).json({
      pool,
    });
  } catch (error) {
    console.error("Get commute pool error:", error);

    return res.status(500).json({
      message: "Failed to get commute pool.",
    });
  }
};

// Get my commute pools
const getMyCommutePools = async (req, res) => {
  try {
    const pools = await CommutePool.find({
      $or: [
        { driver: req.user._id },
        { "members.passenger": req.user._id },
      ],
    })
      .populate("driver", "firstName lastName email role")
      .populate("members.passenger", "firstName lastName email role")
      .populate("recurringCommute");

    return res.status(200).json({
      count: pools.length,
      pools,
    });
  } catch (error) {
    console.error("Get my commute pools error:", error);

    return res.status(500).json({
      message: "Failed to get commute pools.",
    });
  }
};

// Leave commute pool
const leaveCommutePool = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { poolId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(poolId)) {
      return res.status(400).json({
        message: "Invalid commute pool ID.",
      });
    }

    if (req.user.role !== "passenger") {
      return res.status(403).json({
        message: "Only passengers can leave a commute pool.",
      });
    }

    let updatedPool;

    await session.withTransaction(async () => {
      const pool = await CommutePool.findById(poolId).session(session);

      if (!pool) {
        const error = new Error("Commute pool not found.");
        error.statusCode = 404;
        throw error;
      }

      const member = pool.members.find(
        (item) =>
          item.passenger.toString() === req.user._id.toString() &&
          item.status === "active"
      );

      if (!member) {
        const error = new Error(
          "You are not an active member of this commute pool."
        );
        error.statusCode = 404;
        throw error;
      }

      pool.allocatedSeats -= member.seats;
      member.status = "left";

      await pool.save({ session });

      updatedPool = pool;
    });

    await notifyPoolChange(
      updatedPool,
      "A passenger has left your commute pool. Seat availability has been updated.",
      `leave:${req.user._id}:${updatedPool.updatedAt.getTime()}`,
      [req.user._id]
    );

    const populatedPool = await CommutePool.findById(updatedPool._id)
      .populate("driver", "firstName lastName email role")
      .populate("members.passenger", "firstName lastName email role")
      .populate("recurringCommute");

    return res.status(200).json({
      message: "Left commute pool successfully.",
      pool: populatedPool,
    });
  } catch (error) {
    console.error("Leave commute pool error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Failed to leave commute pool.",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createCommutePool,
  joinCommutePool,
  getCommutePool,
  getMyCommutePools,
  leaveCommutePool,
};