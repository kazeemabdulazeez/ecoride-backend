const Verification = require("../models/Verification");
const User = require("../models/User");

// Submit verification information
const submitVerification = async (req, res) => {
  try {
    const { verificationType, documentType, documentNumber, documentUrl } =
      req.body;

    if (!verificationType || !documentType || !documentNumber) {
      return res.status(400).json({
        message:
          "Please provide verification type, document type and document number",
      });
    }

    const existingVerification = await Verification.findOne({
      user: req.user._id,
    });

    if (existingVerification) {
      return res.status(409).json({
        message: "Verification information has already been submitted",
      });
    }

    const verification = await Verification.create({
      user: req.user._id,
      verificationType,
      documentType,
      documentNumber,
      documentUrl,
      status: "pending",
    });

    // Keep the user's verification status synchronized
    await User.findByIdAndUpdate(req.user._id, {
      verificationStatus: "pending",
    });

    res.status(201).json({
      message: "Verification information submitted successfully",
      verification: {
        id: verification._id,
        verificationType: verification.verificationType,
        documentType: verification.documentType,
        status: verification.status,
        submittedAt: verification.submittedAt,
      },
    });
  } catch (error) {
    console.error("Verification submission error:", error.message);

    res.status(500).json({
      message: "Server error during verification submission",
    });
  }
};

// Get current user's verification information
const getVerification = async (req, res) => {
  try {
    const verification = await Verification.findOne({
      user: req.user._id,
    }).select("-documentNumber");

    if (!verification) {
      return res.status(404).json({
        message: "No verification information found",
      });
    }

    res.status(200).json({
      verification,
    });
  } catch (error) {
    console.error("Get verification error:", error.message);

    res.status(500).json({
      message: "Server error while retrieving verification information",
    });
  }
};

module.exports = {
  submitVerification,
  getVerification,
};