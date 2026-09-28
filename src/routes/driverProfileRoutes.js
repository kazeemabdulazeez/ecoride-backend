const express = require("express");

const {
  createOrUpdateDriverProfile,
  getDriverProfile,
} = require("../controllers/driverProfileController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create or update driver profile
router.post("/", protect, createOrUpdateDriverProfile);

// Get current driver's profile
router.get("/", protect, getDriverProfile);

module.exports = router;