const express = require("express");

const {
  createOrUpdateDriverProfile,
  getDriverProfile,
} = require("../controllers/driverProfileController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Driver Profile
 *   description: Driver profile management
 */

/**
 * @swagger
 * /api/driver-profile:
 *   post:
 *     summary: Create or update driver profile
 *     tags: [Driver Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver profile created or updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only drivers can create or update a driver profile
 */
router.post("/", protect, createOrUpdateDriverProfile);

/**
 * @swagger
 * /api/driver-profile:
 *   get:
 *     summary: Get current driver's profile
 *     tags: [Driver Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver profile retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Driver profile not found
 */
router.get("/", protect, getDriverProfile);

module.exports = router;