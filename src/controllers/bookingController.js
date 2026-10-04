const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const CommutePool = require("../models/CommutePool");

const createBooking = async (req, res) => {
  try {
    if (req.user.role !== "passenger") {
      return res.status(403).json({
        message: "Only passengers can create bookings.",
      });
    }

    const { poolId, seats = 1 } = req.body;

    if (!poolId) {
      return res.status(400).json({
        message: "poolId is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(poolId)) {
      return res.status(400).json({
        message: "Invalid commute pool ID.",
      });
    }

    if (!Number.isInteger(seats) || seats < 1) {
      return res.status(400).json({
        message: "Seats must be a positive whole number.",
      });
    }

    const pool = await CommutePool.findById(poolId);

    if (!pool) {
      return res.status(404).json({
        message: "Commute pool not found.",
      });
    }

    if (pool.status !== "active") {
      return res.status(400).json({
        message: "Bookings can only be made for active commute pools.",
      });
    }

    if (pool.driver.toString() === req.user._id.toString()) {
      return res.status(403).json({
        message: "Drivers cannot book seats in their own commute pool.",
      });
    }

    const existingBooking = await Booking.findOne({
      pool: poolId,
      passenger: req.user._id,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "You already have an active booking for this commute pool.",
        booking: existingBooking,
      });
    }

    const availableSeats = pool.totalSeats - pool.allocatedSeats;

    if (seats > availableSeats) {
      return res.status(409).json({
        message: `Not enough seats available. Only ${availableSeats} seat(s) remain.`,
      });
    }

    const booking = await Booking.create({
      pool: poolId,
      passenger: req.user._id,
      seats,
      status: "pending",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("passenger", "firstName lastName email role")
      .populate({
        path: "pool",
        populate: {
          path: "driver",
          select: "firstName lastName email role",
        },
      });

    return res.status(201).json({
      message: "Booking request created successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have an active booking for this commute pool.",
      });
    }

    return res.status(500).json({
      message: "Failed to create booking.",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      passenger: req.user._id,
    })
      .populate({
        path: "pool",
        populate: {
          path: "driver",
          select: "firstName lastName email role",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      message: "Failed to get bookings.",
    });
  }
};

const getBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("passenger", "firstName lastName email role")
      .populate({
        path: "pool",
        populate: {
          path: "driver",
          select: "firstName lastName email role",
        },
      });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    const isPassenger =
      booking.passenger._id.toString() === req.user._id.toString();

    const isDriver =
      booking.pool.driver._id.toString() === req.user._id.toString();

    if (!isPassenger && !isDriver) {
      return res.status(403).json({
        message: "You are not authorized to view this booking.",
      });
    }

    return res.status(200).json({
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    return res.status(500).json({
      message: "Failed to get booking.",
    });
  }
};

const acceptBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    let acceptedBooking;

    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        const error = new Error("Booking not found.");
        error.statusCode = 404;
        throw error;
      }

      const pool = await CommutePool.findById(booking.pool).session(session);

      if (!pool) {
        const error = new Error("Commute pool not found.");
        error.statusCode = 404;
        throw error;
      }

      if (pool.driver.toString() !== req.user._id.toString()) {
        const error = new Error(
          "Only the pool driver can accept a booking."
        );
        error.statusCode = 403;
        throw error;
      }

      if (booking.status !== "pending") {
        const error = new Error(
          `Booking cannot be accepted because it is already ${booking.status}.`
        );
        error.statusCode = 409;
        throw error;
      }

      if (pool.status !== "active") {
        const error = new Error(
          "Bookings can only be accepted for an active commute pool."
        );
        error.statusCode = 400;
        throw error;
      }

      const availableSeats = pool.totalSeats - pool.allocatedSeats;

      if (booking.seats > availableSeats) {
        const error = new Error(
          `Not enough seats available. Only ${availableSeats} seat(s) remain.`
        );
        error.statusCode = 409;
        throw error;
      }

      const alreadyMember = pool.members.find(
        (member) =>
          member.passenger.toString() === booking.passenger.toString() &&
          member.status === "active"
      );

      if (alreadyMember) {
        const error = new Error(
          "Passenger is already an active member of this commute pool."
        );
        error.statusCode = 409;
        throw error;
      }

      pool.members.push({
        passenger: booking.passenger,
        seats: booking.seats,
        joinedAt: new Date(),
        status: "active",
      });

      pool.allocatedSeats += booking.seats;

      booking.status = "accepted";
      booking.acceptedAt = new Date();

      await pool.save({ session });
      await booking.save({ session });

      acceptedBooking = booking;
    });

    const populatedBooking = await Booking.findById(acceptedBooking._id)
      .populate("passenger", "firstName lastName email role")
      .populate({
        path: "pool",
        populate: {
          path: "driver",
          select: "firstName lastName email role",
        },
      });

    return res.status(200).json({
      message: "Booking accepted successfully.",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Accept booking error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Failed to accept booking.",
    });
  } finally {
    await session.endSession();
  }
};

const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(bookingId).populate("pool");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.pool.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only the pool driver can reject a booking.",
      });
    }

    if (booking.status !== "pending") {
      return res.status(409).json({
        message: `Booking cannot be rejected because it is already ${booking.status}.`,
      });
    }

    booking.status = "rejected";
    booking.rejectedAt = new Date();

    await booking.save();

    return res.status(200).json({
      message: "Booking rejected successfully.",
      booking,
    });
  } catch (error) {
    console.error("Reject booking error:", error);

    return res.status(500).json({
      message: "Failed to reject booking.",
    });
  }
};

const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        message: "Invalid booking ID.",
      });
    }

    let cancelledBooking;

    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        const error = new Error("Booking not found.");
        error.statusCode = 404;
        throw error;
      }

      if (booking.passenger.toString() !== req.user._id.toString()) {
        const error = new Error(
          "Only the passenger can cancel this booking."
        );
        error.statusCode = 403;
        throw error;
      }

      if (!["pending", "accepted"].includes(booking.status)) {
        const error = new Error(
          `Booking cannot be cancelled because it is already ${booking.status}.`
        );
        error.statusCode = 409;
        throw error;
      }

      if (booking.status === "accepted") {
        const pool = await CommutePool.findById(booking.pool).session(session);

        if (!pool) {
          const error = new Error("Commute pool not found.");
          error.statusCode = 404;
          throw error;
        }

        const member = pool.members.find(
          (item) =>
            item.passenger.toString() === booking.passenger.toString() &&
            item.status === "active"
        );

        if (member) {
          pool.allocatedSeats -= member.seats;
          member.status = "left";

          await pool.save({ session });
        }
      }

      booking.status = "cancelled";
      booking.cancelledAt = new Date();
      booking.cancelledBy = req.user._id;
      booking.cancellationReason = reason || null;

      await booking.save({ session });

      cancelledBooking = booking;
    });

    return res.status(200).json({
      message: "Booking cancelled successfully.",
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode
        ? error.message
        : "Failed to cancel booking.",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
};