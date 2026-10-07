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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "08012345678"
 *               profilePhoto:
 *                 type: string
 *                 example: "https://example.com/profile.jpg"
 *               bio:
 *                 type: string
 *                 example: "EcoRide test driver"
 *               vehicle:
 *                 type: object
 *                 required:
 *                   - make
 *                   - model
 *                   - year
 *                   - color
 *                   - plateNumber
 *                   - seats
 *                 properties:
 *                   make:
 *                     type: string
 *                     example: "Toyota"
 *                   model:
 *                     type: string
 *                     example: "Corolla"
 *                   year:
 *                     type: number
 *                     example: 2020
 *                   color:
 *                     type: string
 *                     example: "Black"
 *                   plateNumber:
 *                     type: string
 *                     example: "ECO-TEST-01"
 *                   vehicleType:
 *                     type: string
 *                     enum: [car, suv, van, bus]
 *                     example: "car"
 *                   seats:
 *                     type: number
 *                     example: 4
 *     responses:
 *       201:
 *         description: Driver profile created successfully
 *       200:
 *         description: Driver profile updated successfully
 *       400:
 *         description: Complete vehicle information is required
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
 *       403:
 *         description: Only drivers can access a driver profile
 *       404:
 *         description: Driver profile not found
 */
router.get("/", protect, getDriverProfile);

module.exports = router;