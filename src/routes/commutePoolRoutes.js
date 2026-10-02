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

router.use(protect);

router.post("/", createCommutePool);
router.post("/:poolId/join", joinCommutePool);
router.get("/:poolId", getCommutePool);
router.get("/", getMyCommutePools);
router.delete("/:poolId/leave", leaveCommutePool);

module.exports = router;