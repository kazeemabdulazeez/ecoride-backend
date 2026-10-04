const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createBooking,
  getMyBookings,
  getBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.use(protect);

// Passenger booking request
router.post("/", createBooking);

// Passenger's bookings
router.get("/", getMyBookings);

// Get one booking
router.get("/:bookingId", getBooking);

// Driver actions
router.patch("/:bookingId/accept", acceptBooking);
router.patch("/:bookingId/reject", rejectBooking);

// Passenger cancellation
router.patch("/:bookingId/cancel", cancelBooking);

module.exports = router;