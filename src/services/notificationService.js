const Notification = require("../models/Notification");
const ScheduledTrip = require("../models/ScheduledTrip");

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  scheduledTrip = null,
  dedupeKey = null,
}) => {
  try {
    const generatedDedupeKey =
      dedupeKey ||
      `${type}:${recipient}:${scheduledTrip || Date.now()}`;

    return await Notification.create({
      recipient,
      type,
      title,
      message,
      scheduledTrip,
      dedupeKey: generatedDedupeKey,
      sentAt: new Date(),
    });
  } catch (error) {
    if (error.code === 11000) {
      return null;
    }

    throw error;
  }
};

const sendUpcomingTripReminders = async () => {
  const now = new Date();

  const reminderWindow = new Date(
    now.getTime() + 60 * 60 * 1000
  );

  const trips = await ScheduledTrip.find({
    status: "scheduled",
    scheduledFor: {
      $gt: now,
      $lte: reminderWindow,
    },
  }).populate({
    path: "recurringCommute",
    populate: {
      path: "commuter",
      select: "_id",
    },
  });

  let created = 0;

  for (const trip of trips) {
    const commuter = trip.recurringCommute?.commuter;

    if (!commuter) {
      continue;
    }

    const notification = await createNotification({
      recipient: commuter._id,
      type: "trip_reminder",
      title: "Upcoming commute",
      message: `Your scheduled commute is coming up at ${trip.scheduledFor.toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}.`,
      scheduledTrip: trip._id,
      dedupeKey: `trip_reminder:${commuter._id}:${trip._id}`,
    });

    if (notification) {
      created += 1;
    }
  }

  return created;
};

const startNotificationScheduler = () => {
  sendUpcomingTripReminders().catch((error) => {
    console.error("Trip reminder generation failed:", error);
  });

  setInterval(() => {
    sendUpcomingTripReminders().catch((error) => {
      console.error("Trip reminder generation failed:", error);
    });
  }, 15 * 60 * 1000);
};

module.exports = {
  createNotification,
  sendUpcomingTripReminders,
  startNotificationScheduler,
};