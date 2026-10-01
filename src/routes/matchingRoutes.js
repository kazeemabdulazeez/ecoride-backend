const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getMatchingCommutes,
} = require("../controllers/matchingController");

const router = express.Router();

router.use(protect);

router.get("/commutes/:commuteId", getMatchingCommutes);

module.exports = router;