const crypto = require("crypto");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const { calculateFare } = require("../services/fareService");
const {
  initializeTransaction,
  verifyTransaction,
} = require("../services/paystackService");

/**
 * Initialize payment for an accepted booking.
 */
const initializeBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        message: "Booking ID is required.",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("pool")
      .populate("passenger", "firstName lastName email");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found.",
      });
    }

    if (booking.passenger._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can only pay for your own booking.",
      });
    }

    if (booking.status !== "accepted") {
      return res.status(400).json({
        message: "Only accepted bookings can be paid for.",
      });
    }

    const pool = booking.pool;

    if (!pool) {
      return res.status(400).json({
        message: "Commute pool not found.",
      });
    }

    const recurringCommute = await require("../models/RecurringCommute")
      .findById(pool.recurringCommute);

    if (!recurringCommute) {
      return res.status(404).json({
        message: "Recurring commute not found.",
      });
    }

    const fare = calculateFare({
      originLatitude: recurringCommute.route.origin.latitude,
      originLongitude: recurringCommute.route.origin.longitude,
      destinationLatitude: recurringCommute.route.destination.latitude,
      destinationLongitude: recurringCommute.route.destination.longitude,
      seats: booking.seats,
    });

    const existingTransaction = await Transaction.findOne({
      booking: booking._id,
      type: "booking_payment",
      status: {
        $in: ["pending", "successful", "held"],
      },
    });

    if (existingTransaction) {
      return res.status(409).json({
        message: "An active payment already exists for this booking.",
        transaction: existingTransaction,
      });
    }

    const reference = `ECR-${booking._id}-${crypto
      .randomBytes(6)
      .toString("hex")}`;

    const transaction = await Transaction.create({
      booking: booking._id,
      payer: booking.passenger._id,
      payee: pool.driver,
      amount: fare.totalFare,
      currency: fare.currency,
      type: "booking_payment",
      status: "pending",
      provider: "paystack",
      providerReference: reference,
      description: `EcoRide booking payment for ${booking._id}`,
      metadata: {
        seats: booking.seats,
        distanceKm: fare.distanceKm,
        farePerSeat: fare.farePerSeat,
      },
    });

    try {
      const payment = await initializeTransaction({
        email: booking.passenger.email,
        amount: fare.totalFare,
        reference,
      });

      return res.status(201).json({
        message: "Payment initialized successfully.",
        transaction: {
          id: transaction._id,
          reference: transaction.providerReference,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status,
        },
        payment: {
          authorizationUrl: payment.authorization_url,
          accessCode: payment.access_code,
          reference: payment.reference,
        },
        fare,
      });
    } catch (paymentError) {
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: "failed",
        metadata: {
          ...transaction.metadata,
          error:
            paymentError.response?.data?.message ||
            paymentError.message,
        },
      });

      throw paymentError;
    }
  } catch (error) {
    console.error("Initialize payment error:", error);

    return res.status(500).json({
      message: "Failed to initialize payment.",
      error:
        error.response?.data?.message ||
        error.message,
    });
  }
};

/**
 * Verify a Paystack payment.
 */
const verifyBookingPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        message: "Payment reference is required.",
      });
    }

    const transaction = await Transaction.findOne({
      providerReference: reference,
      type: "booking_payment",
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found.",
      });
    }

    if (transaction.payer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to verify this payment.",
      });
    }

    const payment = await verifyTransaction(reference);

    if (payment.status !== "success") {
      transaction.status = "failed";
      transaction.metadata = {
        ...transaction.metadata,
        paystackStatus: payment.status,
      };

      await transaction.save();

      return res.status(400).json({
        message: "Payment was not successful.",
        transaction,
      });
    }

    if (payment.amount !== Math.round(transaction.amount * 100)) {
      return res.status(400).json({
        message: "Payment amount does not match the transaction amount.",
      });
    }

    transaction.status = "held";
    transaction.paidAt = new Date();
    transaction.heldAt = new Date();

    transaction.metadata = {
      ...transaction.metadata,
      paystackStatus: payment.status,
      channel: payment.channel,
      paidAmount: payment.amount,
    };

    await transaction.save();

    return res.status(200).json({
      message: "Payment verified and held successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      message: "Failed to verify payment.",
      error:
        error.response?.data?.message ||
        error.message,
    });
  }
};

module.exports = {
  initializeBookingPayment,
  verifyBookingPayment,
};