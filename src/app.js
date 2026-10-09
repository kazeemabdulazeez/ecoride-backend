const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const driverProfileRoutes = require("./routes/driverProfileRoutes");
const recurringCommuteRoutes = require("./routes/recurringCommuteRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const commutePoolRoutes = require("./routes/commutePoolRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes");
const walletPaymentRoutes = require("./routes/walletPaymentRoutes");
const refundRoutes = require("./routes/refundRoutes");
const paymentReconciliationRoutes = require("./routes/paymentReconciliationRoutes");
const tripSessionRoutes = require("./routes/tripSessionRoutes");
const tripLocationRoutes = require("./routes/tripLocationRoutes");
const incidentRoutes = require("./routes/incidentRoutes");
const tripShareRoutes = require("./routes/tripShareRoutes");
const scheduledTripRoutes = require("./routes/scheduledTripRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/driver-profile", driverProfileRoutes);
app.use("/api/recurring-commutes", recurringCommuteRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/commute-pools", commutePoolRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/wallet-payments", walletPaymentRoutes);
app.use("/api/refunds", refundRoutes);
app.use(
  "/api/payment-reconciliation",
  paymentReconciliationRoutes
);
app.use("/api/trip-sessions", tripSessionRoutes);
app.use("/api/trip-locations", tripLocationRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/trip-shares", tripShareRoutes);
app.use("/api/scheduled-trips", scheduledTripRoutes);
app.use("/api/notifications", notificationRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({
    message: "EcoRide backend is running",
  });
});

module.exports = app;