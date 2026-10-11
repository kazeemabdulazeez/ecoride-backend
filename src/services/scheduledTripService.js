const ScheduledTrip = require("../models/ScheduledTrip");
const RecurringCommute = require("../models/RecurringCommute");
const CommutePool = require("../models/CommutePool");

const DAY_NAMES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const generateScheduledTrips = async (daysAhead = 7) => {
  const recurringCommutes = await RecurringCommute.find({
    status: "active",
  });

  const generatedTrips = [];

  for (const commute of recurringCommutes) {
    const pool = await CommutePool.findOne({
      recurringCommute: commute._id,
      status: "active",
    });

    if (!pool) continue;

    for (let offset = 0; offset <= daysAhead; offset += 1) {
      const scheduledDate = new Date();
      scheduledDate.setHours(0, 0, 0, 0);
      scheduledDate.setDate(scheduledDate.getDate() + offset);

      const dayName = DAY_NAMES[scheduledDate.getDay()];

      if (!commute.schedule.days.includes(dayName)) {
        continue;
      }

      const [hours, minutes] = commute.schedule.departureTime
        .split(":")
        .map(Number);

      scheduledDate.setHours(hours, minutes, 0, 0);

      if (scheduledDate <= new Date()) {
        continue;
      }

      const existingTrip = await ScheduledTrip.findOne({
        recurringCommute: commute._id,
        scheduledFor: scheduledDate,
      });

      if (existingTrip) {
        continue;
      }

      try {
        const scheduledTrip = await ScheduledTrip.create({
          recurringCommute: commute._id,
          pool: pool._id,
          scheduledFor: scheduledDate,
        });

        generatedTrips.push(scheduledTrip);
      } catch (error) {
        // Ignore duplicate-key errors caused by concurrent generation.
        if (error.code !== 11000) {
          throw error;
        }
      }
    }
  }

  return generatedTrips;
};

const startScheduledTripGeneration = () => {
  // Generate upcoming trips when the server starts.
  generateScheduledTrips().catch((error) => {
    console.error("Scheduled trip generation failed:", error);
  });

  // Refresh upcoming scheduled trips every hour.
  setInterval(() => {
    generateScheduledTrips().catch((error) => {
      console.error("Scheduled trip generation failed:", error);
    });
  }, 60 * 60 * 1000);
};

module.exports = {
  generateScheduledTrips,
  startScheduledTripGeneration,
};
