const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const refundBookingPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookingId, reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId is required.",
      });
    }

    let result;

    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw new Error("BOOKING_NOT_FOUND");
      }

      if (
        booking.passenger.toString() !== req.user._id.toString()
      ) {
        throw new Error("NOT_BOOKING_OWNER");
      }

      const transaction = await Transaction.findOne({
        booking: booking._id,
        type: "booking_payment",
        status: "held",
      }).session(session);

      if (!transaction) {
        throw new Error("HELD_PAYMENT_NOT_FOUND");
      }

      const wallet = await Wallet.findOne({
        user: req.user._id,
      }).session(session);

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      if (wallet.status !== "active") {
        throw new Error("WALLET_NOT_ACTIVE");
      }

      if (wallet.heldBalance < transaction.amount) {
        throw new Error("INSUFFICIENT_HELD_BALANCE");
      }

      // Move the held money back into the available wallet balance
      wallet.heldBalance -= transaction.amount;
      wallet.balance += transaction.amount;

      await wallet.save({ session });

      // Mark the original payment as refunded
      transaction.status = "refunded";
      transaction.refundedAt = new Date();

      transaction.metadata = {
        ...(transaction.metadata || {}),
        refundReason: reason || "Booking payment refunded",
        refundedAmount: transaction.amount,
        refundMethod: "wallet",
      };

      transaction.description =
        `Refund for EcoRide booking ${booking._id}`;

      await transaction.save({ session });

      result = {
        wallet,
        transaction,
        refund: {
          amount: transaction.amount,
          currency: transaction.currency,
          reason: reason || "Booking payment refunded",
        },
      };
    });

    return res.status(200).json({
      message: "Booking payment refunded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Refund booking payment error:", error);

    const messages = {
      BOOKING_NOT_FOUND: [
        404,
        "Booking not found.",
      ],

      NOT_BOOKING_OWNER: [
        403,
        "You can only refund your own booking payment.",
      ],

      HELD_PAYMENT_NOT_FOUND: [
        400,
        "No held payment was found for this booking.",
      ],

      WALLET_NOT_FOUND: [
        404,
        "Wallet not found.",
      ],

      WALLET_NOT_ACTIVE: [
        400,
        "Wallet is not active.",
      ],

      INSUFFICIENT_HELD_BALANCE: [
        400,
        "Insufficient held wallet balance for this refund.",
      ],
    };

    const response = messages[error.message];

    if (response) {
      return res.status(response[0]).json({
        message: response[1],
      });
    }

    return res.status(500).json({
      message: "Failed to process booking payment refund.",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  refundBookingPayment,
};