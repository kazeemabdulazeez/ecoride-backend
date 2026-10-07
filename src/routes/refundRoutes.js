const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  refundBookingPayment,
} = require("../controllers/refundController");

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Refunds
 *   description: Booking payment refund management
 */

/**
 * @swagger
 * /api/refunds/booking:
 *   post:
 *     summary: Refund a held booking payment
 *     tags: [Refunds]
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
 *                 example: 6ac64258e99ca2214dea7cc7
 *               reason:
 *                 type: string
 *                 example: Passenger cancelled the booking
 *     responses:
 *       200:
 *         description: Booking payment refunded successfully
 *       400:
 *         description: Invalid refund request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not the booking owner
 *       404:
 *         description: Booking or wallet not found
 *       500:
 *         description: Failed to process refund
 */
router.post("/booking", refundBookingPayment);

module.exports = router;