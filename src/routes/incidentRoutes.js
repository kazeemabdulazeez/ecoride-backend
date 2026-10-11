const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  reportIncident,
  getTripIncidents,
  getIncident,
} = require("../controllers/incidentController");

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Incidents
 *   description: Emergency and incident reporting during trips
 */

/**
 * @swagger
 * /api/incidents/trip/{tripId}:
 *   post:
 *     summary: Report an incident during a trip
 *     description: Allows an authorized trip participant to report an emergency or safety incident.
 *     tags: [Incidents]
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
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum:
 *                   - emergency
 *                   - accident
 *                   - safety
 *                   - medical
 *                   - vehicle_issue
 *                   - harassment
 *                   - other
 *                 example: emergency
 *               severity:
 *                 type: string
 *                 enum:
 *                   - low
 *                   - medium
 *                   - high
 *                   - critical
 *                 example: high
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Vehicle developed a problem during the trip.
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
 *     responses:
 *       201:
 *         description: Incident reported successfully
 *       400:
 *         description: Invalid request data
 *       403:
 *         description: User is not authorized to access this trip
 *       404:
 *         description: Trip session not found
 *       409:
 *         description: Incident cannot be created for a completed or cancelled trip
 */
router.post("/trip/:tripId", reportIncident);

/**
 * @swagger
 * /api/incidents/trip/{tripId}:
 *   get:
 *     summary: Get incidents for a trip
 *     tags: [Incidents]
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
 *         description: Trip incidents retrieved successfully
 *       400:
 *         description: Invalid trip session ID
 *       403:
 *         description: User is not authorized to access this trip
 *       404:
 *         description: Trip session not found
 */
router.get("/trip/:tripId", getTripIncidents);

/**
 * @swagger
 * /api/incidents/{incidentId}:
 *   get:
 *     summary: Get a specific incident
 *     tags: [Incidents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: incidentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Incident ID
 *     responses:
 *       200:
 *         description: Incident retrieved successfully
 *       400:
 *         description: Invalid incident ID
 *       403:
 *         description: User is not authorized to access the incident's trip
 *       404:
 *         description: Incident or trip session not found
 */
router.get("/:incidentId", getIncident);

module.exports = router;