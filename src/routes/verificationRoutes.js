const express = require("express");

const {
  submitVerification,
  getVerification,
} = require("../controllers/verificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Submit verification information
router.post("/", protect, submitVerification);

// Get current user's verification information
router.get("/", protect, getVerification);

module.exports = router;