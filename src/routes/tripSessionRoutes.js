const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createTripSession,
  getTripSession,
  startTripSession,
  completeTripSession,
  cancelTripSession,
} = require("../controllers/tripSessionController");

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Trip Sessions
 *   description: Trip session lifecycle management
 */

/**
 * @swagger
 * /api/trip-sessions:
 *   post:
 *     summary: Create a trip session
 *     description: Creates a trip session from an accepted booking.
 *     tags: [Trip Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: ID of the accepted booking
 *                 example: 65f1a2b3c4d5e6f789012345
 *     responses:
 *       201:
 *         description: Trip session created successfully
 *       400:
 *         description: Invalid booking ID or request
 *       403:
 *         description: User is not authorized
 *       404:
 *         description: Booking or commute pool not found
 *       409:
 *         description: Trip session already exists
 */
router.post("/", createTripSession);

/**
 * @swagger
 * /api/trip-sessions/{tripId}:
 *   get:
 *     summary: Get a trip session
 *     tags: [Trip Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip session ID
 *     responses:
 *       200:
 *         description: Trip session retrieved successfully
 *       400:
 *         description: Invalid trip session ID
 *       403:
 *         description: User is not authorized
 *       404:
 *         description: Trip session not found
 */
router.get("/:tripId", getTripSession);

/**
 * @swagger
 * /api/trip-sessions/{tripId}/start:
 *   patch:
 *     summary: Start a trip session
 *     tags: [Trip Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip session ID
 *     responses:
 *       200:
 *         description: Trip session started successfully
 *       400:
 *         description: Invalid trip session ID
 *       403:
 *         description: Only the driver can start the trip
 *       404:
 *         description: Trip session not found
 *       409:
 *         description: Trip cannot be started in its current state
 */
router.patch("/:tripId/start", startTripSession);

/**
 * @swagger
 * /api/trip-sessions/{tripId}/complete:
 *   patch:
 *     summary: Complete a trip session
 *     tags: [Trip Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip session ID
 *     responses:
 *       200:
 *         description: Trip session completed successfully
 *       400:
 *         description: Invalid trip session ID
 *       403:
 *         description: Only the driver can complete the trip
 *       404:
 *         description: Trip session not found
 *       409:
 *         description: Trip must be started before it can be completed
 */
router.patch("/:tripId/complete", completeTripSession);

/**
 * @swagger
 * /api/trip-sessions/{tripId}/cancel:
 *   patch:
 *     summary: Cancel a trip session
 *     tags: [Trip Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip session ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellationReason:
 *                 type: string
 *                 maxLength: 500
 *                 example: Driver is unavailable
 *     responses:
 *       200:
 *         description: Trip session cancelled successfully
 *       400:
 *         description: Invalid trip session ID
 *       403:
 *         description: User is not authorized
 *       404:
 *         description: Trip session not found
 *       409:
 *         description: Trip cannot be cancelled in its current state
 */
router.patch("/:tripId/cancel", cancelTripSession);

module.exports = router;