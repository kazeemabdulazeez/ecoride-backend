
const express = require("express");
const {
  createIncidentReport,
  getMyIncidentReports,
} = require("../controllers/incidentReportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Incident Reports
 *   description: Reporting and retrieving commute incidents
 */

/**
 * @swagger
 * /api/incidents:
 *   post:
 *     summary: Submit an incident report
 *     tags: [Incident Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pool, reportedUser, type, description]
 *             properties:
 *               pool:
 *                 type: string
 *               reportedUser:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [unsafe_driving, harassment, misconduct, lateness, no_show, vehicle_issue, other]
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *     responses:
 *       201:
 *         description: Incident report submitted
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Users are not participants in the pool
 */
router.post("/", authMiddleware, createIncidentReport);

/**
 * @swagger
 * /api/incidents/my:
 *   get:
 *     summary: Get incident reports submitted by the authenticated user
 *     tags: [Incident Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Incident reports retrieved
 *       401:
 *         description: Authentication required
 */
router.get("/my", authMiddleware, getMyIncidentReports);

module.exports = router;
