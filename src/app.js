const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const driverProfileRoutes = require("./routes/driverProfileRoutes");
const recurringCommuteRoutes = require("./routes/recurringCommuteRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const commutePoolRoutes = require("./routes/commutePoolRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/driver-profile", driverProfileRoutes);
app.use("/api/recurring-commutes", recurringCommuteRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/commute-pools", commutePoolRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "EcoRide backend is running",
  });
});

module.exports = app;