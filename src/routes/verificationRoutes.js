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
 *               - documentType
 *               - documentNumber
 *             properties:
 *               verificationType:
 *                 type: string
 *                 description: Type of verification being submitted
 *                 example: identity
 *               documentType:
 *                 type: string
 *                 description: Type of verification document
 *                 example: national_id
 *               documentNumber:
 *                 type: string
 *                 description: Verification document number
 *                 example: TEST123456
 *               documentUrl:
 *                 type: string
 *                 nullable: true
 *                 description: Optional URL for the uploaded verification document
 *                 example: https://example.com/document
 *           example:
 *             verificationType: identity
 *             documentType: national_id
 *             documentNumber: TEST123456
 *             documentUrl: https://example.com/document
 *     responses:
 *       201:
 *         description: Verification information submitted successfully
 *       400:
 *         description: Verification type, document type or document number is missing
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Verification information has already been submitted
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