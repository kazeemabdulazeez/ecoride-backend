const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

/**
 * Get the authenticated user's wallet.
 * Creates one automatically if it does not exist.
 */
const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
      });
    }

    return res.status(200).json({
      message: "Wallet retrieved successfully.",
      wallet,
    });
  } catch (error) {
    console.error("Get wallet error:", error);

    return res.status(500).json({
      message: "Failed to retrieve wallet.",
    });
  }
};

/**
 * Fund the authenticated user's wallet.
 *
 * This endpoint records the wallet funding request.
 * Actual payment-provider integration will be connected separately.
 */
const fundWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero.",
      });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        user: req.user._id,
      });
    }

    if (wallet.status !== "active") {
      return res.status(400).json({
        message: "Wallet is not active.",
      });
    }

    wallet.balance += amount;

    await wallet.save();

    const transaction = await Transaction.create({
      booking: null,
      payer: req.user._id,
      payee: req.user._id,
      amount,
      currency: wallet.currency,
      type: "wallet_funding",
      status: "successful",
      provider: "wallet",
      description: "Wallet funding",
      paidAt: new Date(),
    });

    return res.status(200).json({
      message: "Wallet funded successfully.",
      wallet,
      transaction,
    });
  } catch (error) {
    console.error("Fund wallet error:", error);

    return res.status(500).json({
      message: "Failed to fund wallet.",
    });
  }
};

module.exports = {
  getWallet,
  fundWallet,
};