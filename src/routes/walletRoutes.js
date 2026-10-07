const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getWallet,
  fundWallet,
} = require("../controllers/walletController");

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Digital wallet management
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get the authenticated user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to retrieve wallet
 */
router.get("/", getWallet);

/**
 * @swagger
 * /api/wallet/fund:
 *   post:
 *     summary: Fund the authenticated user's wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Wallet funded successfully
 *       400:
 *         description: Invalid amount or inactive wallet
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to fund wallet
 */
router.post("/fund", fundWallet);

module.exports = router;