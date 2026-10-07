const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  reconcilePayment,
} = require("../controllers/paymentReconciliationController");

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Payment Reconciliation
 *   description: Payment transaction reconciliation
 */

/**
 * @swagger
 * /api/payment-reconciliation/{transactionId}:
 *   get:
 *     summary: Reconcile a payment transaction
 *     tags: [Payment Reconciliation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6ac6462753733af9c1ab6382
 *     responses:
 *       200:
 *         description: Payment reconciliation result
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Failed to reconcile payment
 */
router.get("/:transactionId", reconcilePayment);

module.exports = router;