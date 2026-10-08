const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createTripShare,
  getSharedTrip,
  revokeTripShare,
} = require("../controllers/tripShareController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trip Sharing
 *   description: Secure trip-sharing links
 */

/**
 * @swagger
 * /api/trip-shares/{token}:
 *   get:
 *     summary: View a shared trip
 *     description: Public endpoint that allows anyone with a valid, non-expired sharing token to view limited trip information.
 *     tags: [Trip Sharing]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Secure trip-sharing token
 *     responses:
 *       200:
 *         description: Shared trip retrieved successfully
 *       400:
 *         description: Invalid sharing token
 *       404:
 *         description: Trip-sharing link not found or invalid
 *       410:
 *         description: Trip-sharing link has expired or been revoked
 */
router.get("/:token", getSharedTrip);

// Protected routes
router.use(protect);

/**
 * @swagger
 * /api/trip-shares/trip/{tripId}:
 *   post:
 *     summary: Create a trip-sharing link
 *     description: Allows the passenger of a trip to create a secure sharing link that expires after 24 hours.
 *     tags: [Trip Sharing]
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
 *       201:
 *         description: Trip-sharing link created successfully
 *       400:
 *         description: Invalid trip session ID
 *       403:
 *         description: Only the passenger can create a trip-sharing link
 *       404:
 *         description: Trip session not found
 *       409:
 *         description: Trip is completed or cancelled
 */
router.post("/trip/:tripId", createTripShare);

/**
 * @swagger
 * /api/trip-shares/{shareId}/revoke:
 *   patch:
 *     summary: Revoke a trip-sharing link
 *     description: Allows the passenger who created a trip-sharing link to revoke it.
 *     tags: [Trip Sharing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shareId
 *         required: true
 *         schema:
 *           type: string
 *         description: Trip-sharing record ID
 *     responses:
 *       200:
 *         description: Trip-sharing link revoked successfully
 *       400:
 *         description: Invalid trip-share ID
 *       403:
 *         description: User is not authorized to revoke this link
 *       404:
 *         description: Trip-sharing link not found
 *       409:
 *         description: Trip-sharing link has already been revoked
 */
router.patch("/:shareId/revoke", revokeTripShare);

module.exports = router;