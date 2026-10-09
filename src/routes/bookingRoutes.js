
const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createBooking,
  getMyBookings,
  getBooking,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} = require("../controllers/bookingController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Seat request and booking management
 */

router.use(protect);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a booking request
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - poolId
 *             properties:
 *               poolId:
 *                 type: string
 *                 description: ID of the commute pool
 *                 example: 6ac19fa43bebe497d6961075
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       201:
 *         description: Booking request created successfully
 *       400:
 *         description: Invalid booking request
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only passengers can create bookings
 *       409:
 *         description: Active booking already exists or insufficient seats
 */
router.post("/", createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get the current passenger's bookings
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/", getMyBookings);

/**
 * @swagger
 * /api/bookings/{bookingId}:
 *   get:
 *     summary: Get a booking by ID
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       400:
 *         description: Invalid booking ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Not authorized to view this booking
 *       404:
 *         description: Booking not found
 */
router.get("/:bookingId", getBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/accept:
 *   patch:
 *     summary: Accept a booking request
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: Booking accepted successfully
 *       400:
 *         description: Booking cannot be accepted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the pool driver can accept a booking
 *       404:
 *         description: Booking or commute pool not found
 *       409:
 *         description: Not enough seats or booking conflict
 */
router.patch("/:bookingId/accept", acceptBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/reject:
 *   patch:
 *     summary: Reject a booking request
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Invalid booking ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the pool driver can reject a booking
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking cannot be rejected in its current state
 */
router.patch("/:bookingId/reject", rejectBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Change of plans
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Invalid booking ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the passenger can cancel a booking
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking cannot be cancelled in its current state
 */
router.patch("/:bookingId/cancel", cancelBooking);

/**
 * @swagger
 * /api/bookings/{bookingId}/complete:
 *   patch:
 *     summary: Mark an accepted booking as completed
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking
 *     responses:
 *       200:
 *         description: Booking marked as completed
 *       400:
 *         description: Booking cannot be completed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only the pool driver can complete a booking
 *       404:
 *         description: Booking or commute pool not found
 */
router.patch("/:bookingId/complete", completeBooking);

module.exports = router;
