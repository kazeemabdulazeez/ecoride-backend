const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  createRecurringCommute,
  getMyRecurringCommutes,
  getRecurringCommuteById,
  updateRecurringCommute,
  pauseRecurringCommute,
  cancelRecurringCommute,
} = require("../controllers/recurringCommuteController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recurring Commute
 *   description: Recurring commute management
 */

/**
 * @swagger
 * /api/recurring-commutes:
 *   post:
 *     summary: Create a recurring commute
 *     tags: [Recurring Commute]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - route
 *               - schedule
 *             properties:
 *               route:
 *                 type: object
 *                 required:
 *                   - origin
 *                   - destination
 *                 properties:
 *                   origin:
 *                     type: object
 *                     required:
 *                       - name
 *                       - latitude
 *                       - longitude
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Ikeja"
 *                       latitude:
 *                         type: number
 *                         example: 6.6018
 *                       longitude:
 *                         type: number
 *                         example: 3.3515
 *                   destination:
 *                     type: object
 *                     required:
 *                       - name
 *                       - latitude
 *                       - longitude
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Victoria Island"
 *                       latitude:
 *                         type: number
 *                         example: 6.4281
 *                       longitude:
 *                         type: number
 *                         example: 3.4219
 *               schedule:
 *                 type: object
 *                 required:
 *                   - days
 *                   - departureTime
 *                 properties:
 *                   days:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum:
 *                         - monday
 *                         - tuesday
 *                         - wednesday
 *                         - thursday
 *                         - friday
 *                         - saturday
 *                         - sunday
 *                     example:
 *                       - monday
 *                       - wednesday
 *                       - friday
 *                   departureTime:
 *                     type: string
 *                     example: "08:00"
 *               pickupPoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Ikeja City Mall"
 *                     latitude:
 *                       type: number
 *                       example: 6.6170
 *                     longitude:
 *                       type: number
 *                       example: 3.3510
 *               preferences:
 *                 type: object
 *                 properties:
 *                   seatsNeeded:
 *                     type: number
 *                     example: 1
 *                   notes:
 *                     type: string
 *                     example: "Morning commute"
 *     responses:
 *       201:
 *         description: Recurring commute created successfully
 *       400:
 *         description: Invalid recurring commute data
 *       401:
 *         description: Authentication required
 */
router.post("/", protect, createRecurringCommute);

/**
 * @swagger
 * /api/recurring-commutes:
 *   get:
 *     summary: Get current user's recurring commutes
 *     tags: [Recurring Commute]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recurring commutes retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/", protect, getMyRecurringCommutes);

/**
 * @swagger
 * /api/recurring-commutes/{id}:
 *   get:
 *     summary: Get a recurring commute by ID
 *     tags: [Recurring Commute]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recurring commute ID
 *     responses:
 *       200:
 *         description: Recurring commute retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recurring commute not found
 */
router.get("/:id", protect, getRecurringCommuteById);

/**
 * @swagger
 * /api/recurring-commutes/{id}:
 *   patch:
 *     summary: Update a recurring commute
 *     description: Update the route, schedule, pickup points, preferences, or status of a recurring commute. A schedule update triggers a schedule-change notification.
 *     tags: [Recurring Commute]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recurring commute ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               route:
 *                 type: object
 *                 properties:
 *                   origin:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Ikeja"
 *                       latitude:
 *                         type: number
 *                         example: 6.6018
 *                       longitude:
 *                         type: number
 *                         example: 3.3515
 *                   destination:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Victoria Island"
 *                       latitude:
 *                         type: number
 *                         example: 6.4281
 *                       longitude:
 *                         type: number
 *                         example: 3.4219
 *               schedule:
 *                 type: object
 *                 properties:
 *                   days:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum:
 *                         - monday
 *                         - tuesday
 *                         - wednesday
 *                         - thursday
 *                         - friday
 *                         - saturday
 *                         - sunday
 *                     example:
 *                       - monday
 *                       - wednesday
 *                       - friday
 *                   departureTime:
 *                     type: string
 *                     example: "09:00"
 *               pickupPoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Ikeja City Mall"
 *                     latitude:
 *                       type: number
 *                       example: 6.6170
 *                     longitude:
 *                       type: number
 *                       example: 3.3510
 *               preferences:
 *                 type: object
 *                 properties:
 *                   seatsNeeded:
 *                     type: number
 *                     example: 1
 *                   notes:
 *                     type: string
 *                     example: "Updated morning commute"
 *               status:
 *                 type: string
 *                 enum:
 *                   - active
 *                   - paused
 *                   - cancelled
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Recurring commute updated successfully
 *       400:
 *         description: Invalid recurring commute data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recurring commute not found
 */
router.patch("/:id", protect, updateRecurringCommute);

/**
 * @swagger
 * /api/recurring-commutes/{id}/pause:
 *   patch:
 *     summary: Pause a recurring commute
 *     tags: [Recurring Commute]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recurring commute ID
 *     responses:
 *       200:
 *         description: Recurring commute paused successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recurring commute not found
 */
router.patch("/:id/pause", protect, pauseRecurringCommute);

/**
 * @swagger
 * /api/recurring-commutes/{id}/cancel:
 *   patch:
 *     summary: Cancel a recurring commute
 *     tags: [Recurring Commute]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recurring commute ID
 *     responses:
 *       200:
 *         description: Recurring commute cancelled successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Recurring commute not found
 */
router.patch("/:id/cancel", protect, cancelRecurringCommute);

module.exports = router;