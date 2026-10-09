
const express = require("express");
const {
  getReliabilityScore,
  refreshMyReliabilityScore,
} = require("../controllers/reliabilityController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reliability
 *   description: EcoRide user reliability scores
 */

/**
 * @swagger
 * /api/reliability/user/{userId}:
 *   get:
 *     summary: Get a user's reliability score
 *     tags: [Reliability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reliability score retrieved
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Authentication required
 */
router.get("/user/:userId", authMiddleware, getReliabilityScore);

/**
 * @swagger
 * /api/reliability/my/recalculate:
 *   post:
 *     summary: Recalculate the authenticated user's reliability score
 *     tags: [Reliability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reliability score recalculated
 *       401:
 *         description: Authentication required
 */
router.post("/my/recalculate", authMiddleware, refreshMyReliabilityScore);

module.exports = router;
