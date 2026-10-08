const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  initializeBookingPayment,
  verifyBookingPayment,
} = require("../controllers/paymentController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Booking payment and transaction management
 */

router.use(protect);

/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize payment for an accepted booking
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: ID of the accepted booking to pay for
 *                 example: "6ac1b44316242a776ef02ee7"
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 *       400:
 *         description: Invalid booking or payment data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not authorized to pay for the booking
 *       404:
 *         description: Booking or commute data not found
 *       409:
 *         description: An active payment already exists for the booking
 *       500:
 *         description: Payment initialization failed
 */
router.post("/initialize", initializeBookingPayment);

/**
 * @swagger
 * /api/payments/verify/{reference}:
 *   get:
 *     summary: Verify a Paystack payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Paystack transaction reference
 *     responses:
 *       200:
 *         description: Payment verified and held successfully
 *       400:
 *         description: Payment was unsuccessful or amount does not match
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not authorized to verify this payment
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Payment verification failed
 */
router.get("/verify/:reference", verifyBookingPayment);

module.exports = router;