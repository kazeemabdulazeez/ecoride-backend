const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getMatchingCommutes,
} = require("../controllers/matchingController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Matching
 *   description: Smart route and time matching
 */

/**
 * @swagger
 * /api/matching/commutes/{commuteId}:
 *   get:
 *     summary: Get matching commutes
 *     description: Find compatible recurring commutes based on route, departure time, schedule, pickup point, and available seats.
 *     tags: [Matching]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commuteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the recurring commute to find matches for
 *     responses:
 *       200:
 *         description: Matching commutes retrieved successfully
 *       400:
 *         description: Invalid commute ID or matching request
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recurring commute not found
 */
router.get("/commutes/:commuteId", protect, getMatchingCommutes);

module.exports = router;