const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  payBookingWithWallet,
} = require("../controllers/walletPaymentController");

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/wallet-payments/pay:
 *   post:
 *     summary: Pay for an accepted booking using wallet balance
 *     tags: [Wallet Payments]
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
 *                 example: 6ac54cb0516cbf6879f672ef
 *     responses:
 *       200:
 *         description: Booking paid successfully from wallet
 *       400:
 *         description: Invalid booking, insufficient balance, or existing payment
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: User is not the booking owner
 *       404:
 *         description: Booking, wallet, or commute not found
 *       500:
 *         description: Failed to process wallet payment
 */
router.post("/pay", payBookingWithWallet);

module.exports = router;