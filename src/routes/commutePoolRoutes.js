const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  createCommutePool,
  joinCommutePool,
  getCommutePool,
  getMyCommutePools,
  leaveCommutePool,
} = require("../controllers/commutePoolController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Commute Pool
 *   description: Trusted recurring commute pool management
 */

/**
 * @swagger
 * /api/commute-pools:
 *   post:
 *     summary: Create a commute pool
 *     tags: [Commute Pool]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Commute pool created successfully
 *       400:
 *         description: Invalid commute pool data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Only drivers can create commute pools
 */
router.post("/", protect, createCommutePool);

/**
 * @swagger
 * /api/commute-pools/{poolId}/join:
 *   post:
 *     summary: Join a commute pool
 *     tags: [Commute Pool]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *         description: Commute pool ID
 *     responses:
 *       200:
 *         description: Successfully joined commute pool
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Authentication required
 *       409:
 *         description: No available seats or membership conflict
 */
router.post("/:poolId/join", protect, joinCommutePool);

/**
 * @swagger
 * /api/commute-pools/{poolId}:
 *   get:
 *     summary: Get a commute pool
 *     tags: [Commute Pool]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *         description: Commute pool ID
 *     responses:
 *       200:
 *         description: Commute pool retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Commute pool not found
 */
router.get("/:poolId", protect, getCommutePool);

/**
 * @swagger
 * /api/commute-pools:
 *   get:
 *     summary: Get current user's commute pools
 *     tags: [Commute Pool]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's commute pools retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/", protect, getMyCommutePools);

/**
 * @swagger
 * /api/commute-pools/{poolId}/leave:
 *   delete:
 *     summary: Leave a commute pool
 *     tags: [Commute Pool]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: poolId
 *         required: true
 *         schema:
 *           type: string
 *         description: Commute pool ID
 *     responses:
 *       200:
 *         description: Successfully left commute pool
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Commute pool or membership not found
 */
router.delete("/:poolId/leave", protect, leaveCommutePool);

module.exports = router;