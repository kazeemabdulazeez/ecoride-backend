require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const {
  startScheduledTripGeneration,
} = require("./services/scheduledTripService");

const {
  startNotificationScheduler,
} = require("./services/notificationService");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB before starting the server or schedulers.
    await connectDB();

    app.listen(PORT, () => {
      console.log(`EcoRide backend running on port ${PORT}`);

      startScheduledTripGeneration();
      startNotificationScheduler();
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
