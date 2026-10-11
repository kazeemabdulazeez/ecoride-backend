
const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const Booking = require("../models/Booking");
const CommutePool = require("../models/CommutePool");

const getUserId = (user) => user?._id?.toString() || user?.id?.toString();

const createRating = async (req, res) => {
  try {
    const raterId = getUserId(req.user);
    const { booking: bookingId, ratee: rateeId, score, review = "" } =
      req.body;

    if (!raterId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      !mongoose.isValidObjectId(bookingId) ||
      !mongoose.isValidObjectId(rateeId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid booking and recipient IDs are required.",
      });
    }

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: "Score must be a whole number from 1 to 5.",
      });
    }

    if (typeof review !== "string" || review.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review must be text with a maximum of 1000 characters.",
      });
    }

    if (raterId === rateeId) {
      return res.status(400).json({
        success: false,
        message: "You cannot rate yourself.",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Ratings are only allowed for completed trips.",
      });
    }

    const pool = await CommutePool.findById(booking.pool);

    if (!pool) {
      return res.status(404).json({
        success: false,
        message: "Associated commute pool not found.",
      });
    }

    // A rating must be between the driver and the passenger
    // associated with this specific booking.
    const driverId = pool.driver.toString();
    const passengerId = booking.passenger.toString();

    console.log("Rating authorization debug:", {
  raterId,
  rateeId,
  driverId,
  passengerId,
});

    const isValidPair =
      (raterId === driverId && rateeId === passengerId) ||
      (raterId === passengerId && rateeId === driverId);

    if (!isValidPair) {
      return res.status(403).json({
        success: false,
        message:
          "Only the driver and passenger on this booking can rate each other.",
      });
    }

    const rating = await Rating.create({
      booking: booking._id,
      pool: pool._id,
      rater: raterId,
      ratee: rateeId,
      score,
      review: review.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Rating submitted successfully.",
      data: rating,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already rated this user for this booking.",
      });
    }

    console.error("Create rating error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit rating.",
    });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "A valid user ID is required.",
      });
    }

    const ratings = await Rating.find({ ratee: userId })
      .populate("rater", "firstName lastName")
      .sort({ createdAt: -1 });

    const averageRating = ratings.length
      ? Number(
          (
            ratings.reduce((sum, rating) => sum + rating.score, 0) /
            ratings.length
          ).toFixed(2)
        )
      : 0;

    return res.status(200).json({
      success: true,
      count: ratings.length,
      averageRating,
      data: ratings,
    });
  } catch (error) {
    console.error("Get user ratings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve ratings.",
    });
  }
};

module.exports = { createRating, getUserRatings };
