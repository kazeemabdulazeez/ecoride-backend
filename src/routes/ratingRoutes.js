
const express = require("express");
const {
  createRating,
  getUserRatings,
} = require("../controllers/ratingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Ratings and reviews for EcoRide users
 */

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Submit a rating and review
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [booking, ratee, score]
 *             properties:
 *               booking:
 *                 type: string
 *                 description: Booking ID
 *               ratee:
 *                 type: string
 *                 description: ID of the user being rated
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Rating submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not a trip participant
 *       409:
 *         description: Duplicate rating
 */
router.post("/", authMiddleware, createRating);

/**
 * @swagger
 * /api/ratings/user/{userId}:
 *   get:
 *     summary: Get ratings received by a user
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User ratings and average score
 *       400:
 *         description: Invalid user ID
 */
router.get("/user/:userId", getUserRatings);

module.exports = router;
