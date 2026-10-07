const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

const reconcileTransaction = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    return {
      reconciled: false,
      reason: "Transaction not found.",
    };
  }

  const issues = [];

  // Booking payments should have a booking reference
  if (
    transaction.type === "booking_payment" &&
    !transaction.booking
  ) {
    issues.push("Booking payment is missing booking reference.");
  }

  // Wallet payments should use the wallet provider
  if (
    transaction.provider === "wallet" &&
    transaction.type === "booking_payment"
  ) {
    const wallet = await Wallet.findOne({
      user: transaction.payer,
    });

    if (!wallet) {
      issues.push("Payer wallet not found.");
    } else {
      const paymentIsHeld = transaction.status === "held";

      if (paymentIsHeld && wallet.heldBalance < transaction.amount) {
        issues.push(
          "Wallet held balance is lower than the transaction amount."
        );
      }
    }
  }

  // Refunded payments should have a refund timestamp
  if (
    transaction.status === "refunded" &&
    !transaction.refundedAt
  ) {
    issues.push(
      "Refunded transaction is missing refundedAt timestamp."
    );
  }

  // Successful payments should have paidAt
  if (
    transaction.status === "successful" &&
    !transaction.paidAt
  ) {
    issues.push(
      "Successful transaction is missing paidAt timestamp."
    );
  }

  return {
    reconciled: issues.length === 0,
    transactionId: transaction._id,
    status: transaction.status,
    amount: transaction.amount,
    currency: transaction.currency,
    provider: transaction.provider,
    issues,
  };
};

module.exports = {
  reconcileTransaction,
};