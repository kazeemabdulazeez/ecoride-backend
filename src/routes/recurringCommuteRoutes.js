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