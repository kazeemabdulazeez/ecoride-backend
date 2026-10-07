const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const RecurringCommute = require("../models/RecurringCommute");
const { calculateFare } = require("../services/fareService");

const payBookingWithWallet = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId is required.",
      });
    }

    let result;

    await session.withTransaction(async () => {
      const booking = await Booking.findById(bookingId)
        .populate("pool")
        .session(session);

      if (!booking) {
        throw new Error("BOOKING_NOT_FOUND");
      }

      if (booking.passenger.toString() !== req.user._id.toString()) {
        throw new Error("NOT_BOOKING_OWNER");
      }

      if (booking.status !== "accepted") {
        throw new Error("BOOKING_NOT_ACCEPTED");
      }

      const existingPayment = await Transaction.findOne({
        booking: booking._id,
        type: "booking_payment",
        status: { $in: ["pending", "successful", "held"] },
      }).session(session);

      if (existingPayment) {
        throw new Error("PAYMENT_ALREADY_EXISTS");
      }

      const recurringCommute = await RecurringCommute.findById(
        booking.pool.recurringCommute
      ).session(session);

      if (!recurringCommute) {
        throw new Error("COMMUTE_NOT_FOUND");
      }

      const fare = calculateFare({
        originLatitude: recurringCommute.route.origin.latitude,
        originLongitude: recurringCommute.route.origin.longitude,
        destinationLatitude: recurringCommute.route.destination.latitude,
        destinationLongitude: recurringCommute.route.destination.longitude,
        seats: booking.seats,
      });

      const wallet = await Wallet.findOne({
        user: req.user._id,
      }).session(session);

      if (!wallet) {
        throw new Error("WALLET_NOT_FOUND");
      }

      if (wallet.status !== "active") {
        throw new Error("WALLET_NOT_ACTIVE");
      }

      if (wallet.balance < fare.totalFare) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      wallet.balance -= fare.totalFare;
      wallet.heldBalance += fare.totalFare;

      await wallet.save({ session });

      const [transaction] = await Transaction.create(
        [
          {
            booking: booking._id,
            payer: req.user._id,
            payee: booking.pool.driver,
            amount: fare.totalFare,
            currency: fare.currency,
            type: "booking_payment",
            status: "held",
            provider: "wallet",
            description: `EcoRide wallet payment for booking ${booking._id}`,
            metadata: {
              seats: booking.seats,
              distanceKm: fare.distanceKm,
              farePerSeat: fare.farePerSeat,
            },
            paidAt: new Date(),
            heldAt: new Date(),
          },
        ],
        { session }
      );

      result = {
        wallet,
        transaction,
        fare,
      };
    });

    return res.status(200).json({
      message: "Booking paid successfully from wallet.",
      ...result,
    });
  } catch (error) {
    console.error("Wallet booking payment error:", error);

    const messages = {
      BOOKING_NOT_FOUND: [404, "Booking not found."],
      NOT_BOOKING_OWNER: [403, "You can only pay for your own booking."],
      BOOKING_NOT_ACCEPTED: [400, "Only accepted bookings can be paid for."],
      PAYMENT_ALREADY_EXISTS: [400, "This booking already has an active payment."],
      COMMUTE_NOT_FOUND: [404, "Recurring commute not found."],
      WALLET_NOT_FOUND: [404, "Wallet not found."],
      WALLET_NOT_ACTIVE: [400, "Wallet is not active."],
      INSUFFICIENT_BALANCE: [400, "Insufficient wallet balance."],
    };

    const response = messages[error.message];

    if (response) {
      return res.status(response[0]).json({
        message: response[1],
      });
    }

    return res.status(500).json({
      message: "Failed to process wallet payment.",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  payBookingWithWallet,
};