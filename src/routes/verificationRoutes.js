const express = require("express");

const {
  submitVerification,
  getVerification,
} = require("../controllers/verificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Verification
 *   description: User verification endpoints
 */

/**
 * @swagger
 * /api/verification:
 *   post:
 *     summary: Submit verification information
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationType
 *             properties:
 *               verificationType:
 *                 type: string
 *                 description: Type of verification being submitted
 *           example:
 *             verificationType: "identity"
 *     responses:
 *       201:
 *         description: Verification submitted successfully
 *       400:
 *         description: Invalid verification data
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error during verification submission
 */
router.post("/", protect, submitVerification);

/**
 * @swagger
 * /api/verification:
 *   get:
 *     summary: Get current user's verification information
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification information retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Verification information not found
 */
router.get("/", protect, getVerification);

module.exports = router;