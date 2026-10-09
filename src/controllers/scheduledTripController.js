const ScheduledTrip = require("../models/ScheduledTrip");

const getUpcomingScheduledTrips = async (req, res) => {
  try {
    const now = new Date();

    const trips = await ScheduledTrip.find({
      status: "scheduled",
      scheduledFor: { $gte: now },
    })
      .populate({
        path: "recurringCommute",
        select: "route schedule pickupPoints preferences",
      })
      .populate({
        path: "pool",
        select: "driver totalSeats allocatedSeats status",
        populate: {
          path: "driver",
          select: "name email phone",
        },
      })
      .sort({ scheduledFor: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips,
    });
  } catch (error) {
    console.error("Get upcoming scheduled trips error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming scheduled trips",
    });
  }
};

const getMyUpcomingScheduledTrips = async (req, res) => {
  try {
    const now = new Date();

    const trips = await ScheduledTrip.find({
      status: "scheduled",
      scheduledFor: { $gte: now },
    })
      .populate({
        path: "recurringCommute",
        match: { commuter: req.user._id },
        select: "route schedule pickupPoints preferences commuter",
      })
      .populate({
        path: "pool",
        select: "driver totalSeats allocatedSeats status",
        populate: {
          path: "driver",
          select: "name email phone",
        },
      })
      .sort({ scheduledFor: 1 });

    const filteredTrips = trips.filter((trip) => trip.recurringCommute);

    res.status(200).json({
      success: true,
      count: filteredTrips.length,
      data: filteredTrips,
    });
  } catch (error) {
    console.error("Get my upcoming scheduled trips error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your upcoming scheduled trips",
    });
  }
};

module.exports = {
  getUpcomingScheduledTrips,
  getMyUpcomingScheduledTrips,
};