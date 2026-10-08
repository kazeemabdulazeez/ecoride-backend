const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  updateTripLocation,
  getTripLocations,
  getLatestTripLocation,
} = require("../controllers/tripLocationController");

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Trip Locations
 *   description: Live trip location tracking
 */

/**
 * @swagger
 * /api/trip-locations/{tripId}:
 *   post:
 *     summary: Update the current trip location
 *     description: Records a driver's or passenger's location while a trip is active.
 *     tags: [Trip Locations]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 example: 6.5244
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 example: 3.3792
 *               accuracy:
 *                 type: number
 *                 minimum: 0
 *                 example: 10
 *               speed:
 *                 type: number
 *                 minimum: 0
 *                 example: 35
 *               heading:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 360
 *                 example: 180
 *     responses:
 *       201:
 *         description: Trip location updated successfully
 *       400:
 *         description: Invalid trip ID or location data
 *       403:
 *         description: User is not authorized to access the trip
 *       404:
 *         description: Trip session not found
 *       409:
 *         description: Location can only be updated while the trip is active
 */
router.post("/:tripId", updateTripLocation);

/**
 * @swagger
 * /api/trip-locations/{tripId}:
 *   get:
 *     summary: Get trip location history
 *     tags: [Trip Locations]
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
 *         description: Trip location history retrieved successfully
 *       400:
 *         description: Invalid trip ID
 *       403:
 *         description: User is not authorized to access the trip
 *       404:
 *         description: Trip session not found
 */
router.get("/:tripId", getTripLocations);

/**
 * @swagger
 * /api/trip-locations/{tripId}/latest:
 *   get:
 *     summary: Get the latest trip location
 *     tags: [Trip Locations]
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
 *         description: Latest trip location retrieved successfully
 *       400:
 *         description: Invalid trip ID
 *       403:
 *         description: User is not authorized to access the trip
 *       404:
 *         description: Trip session or latest location not found
 */
router.get("/:tripId/latest", getLatestTripLocation);

module.exports = router;