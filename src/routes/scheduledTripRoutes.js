const express = require("express");
const {
  getUpcomingScheduledTrips,
  getMyUpcomingScheduledTrips,
} = require("../controllers/scheduledTripController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Scheduled Trips
 *   description: Manage and retrieve generated recurring commute trip occurrences
 */

/**
 * @swagger
 * /api/scheduled-trips:
 *   get:
 *     summary: Get all upcoming scheduled trips
 *     tags: [Scheduled Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upcoming scheduled trips retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch upcoming scheduled trips
 */
router.get("/", protect, getUpcomingScheduledTrips);

/**
 * @swagger
 * /api/scheduled-trips/my:
 *   get:
 *     summary: Get upcoming scheduled trips for the logged-in commuter
 *     tags: [Scheduled Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User upcoming scheduled trips retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fetch user scheduled trips
 */
router.get("/my", protect, getMyUpcomingScheduledTrips);

module.exports = router;