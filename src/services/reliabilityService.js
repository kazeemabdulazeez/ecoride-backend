
const mongoose = require("mongoose");
const Rating = require("../models/Rating");
const Booking = require("../models/Booking");
const CommutePool = require("../models/CommutePool");
const IncidentReport = require("../models/IncidentReport");
const ReliabilityScore = require("../models/ReliabilityScore");

const calculateReliability = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("A valid user ID is required to calculate reliability.");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Find pools driven by this user.
  const driverPools = await CommutePool.find({
    driver: userObjectId,
  }).select("_id");

  const driverPoolIds = driverPools.map((pool) => pool._id);

  const [ratingStats, cancellations, incidentReports, completedTrips] =
    await Promise.all([
      Rating.aggregate([
        { $match: { ratee: userObjectId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$score" },
            totalRatings: { $sum: 1 },
          },
        },
      ]),

      Booking.countDocuments({
        cancelledBy: userObjectId,
        status: "cancelled",
      }),

      // Only resolved reports are included in this metric.
      IncidentReport.countDocuments({
        reportedUser: userObjectId,
        status: "resolved",
      }),

      // Count completed bookings as a passenger or as a pool driver.
      Booking.countDocuments({
        status: "completed",
        $or: [
          { passenger: userObjectId },
          { pool: { $in: driverPoolIds } },
        ],
      }),
    ]);

  const averageRating = ratingStats.length
    ? Number(ratingStats[0].averageRating.toFixed(2))
    : 0;

  // A missing rating is unknown, not a perfect score.
  const score = ratingStats.length
    ? Math.round((averageRating / 5) * 100)
    : null;

  return ReliabilityScore.findOneAndUpdate(
    { user: userObjectId },
    {
      $set: {
        score,
        averageRating,
        cancellations,
        incidentReports,
        completedTrips,
        lastCalculatedAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

module.exports = { calculateReliability };
