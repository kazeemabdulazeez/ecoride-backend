const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createRecurringCommute,
  getMyRecurringCommutes,
  getRecurringCommuteById,
  updateRecurringCommute,
  pauseRecurringCommute,
  cancelRecurringCommute,
} = require("../controllers/recurringCommuteController");

const router = express.Router();

// All recurring commute routes require authentication
router.use(protect);

// Create a recurring commute
router.post("/", createRecurringCommute);

// Get all recurring commutes belonging to the logged-in user
router.get("/", getMyRecurringCommutes);

// Get one recurring commute
router.get("/:id", getRecurringCommuteById);

// Update a recurring commute
router.patch("/:id", updateRecurringCommute);

// Pause a recurring commute
router.patch("/:id/pause", pauseRecurringCommute);

// Cancel a recurring commute
router.patch("/:id/cancel", cancelRecurringCommute);

module.exports = router;