const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const { sendOtpEmail } = require("../services/emailService");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register user
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message: "Please provide first name, last name, email and password",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "passenger",
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      token,
      requiresEmailVerification: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error during login",
    });
  }
};

// Send OTP
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Don't send OTP if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        message: "User email is already verified",
      });
    }

    // Prevent requesting another OTP too quickly
    if (
      user.otpLastSentAt &&
      Date.now() - user.otpLastSentAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        message: "Please wait 60 seconds before requesting another OTP",
      });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing it
    const otpHash = await bcrypt.hash(otp, 10);

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();

    await user.save();

    // Send OTP using Nodemailer + Gmail OAuth2
    try {
      await sendOtpEmail(user.email, otp);
    } catch (error) {
      console.error("OTP email error:", error);

      // Clear OTP if email could not be sent
      user.otpHash = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      user.otpLastSentAt = null;

      await user.save();

      return res.status(500).json({
        message: "Failed to send OTP email",
      });
    }

    console.log(`OTP email sent to ${user.email}`);

    res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP error:", error.message);

    res.status(500).json({
      message: "Server error while sending OTP",
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "No active OTP. Please request a new OTP",
      });
    }

    if (user.otpExpiresAt < new Date()) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      user.otpAttempts = 0;
      await user.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP",
      });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP",
      });
    }

    const isValidOtp = await bcrypt.compare(
      otp.toString(),
      user.otpHash
    );

    if (!isValidOtp) {
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // OTP is correct
    user.emailVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    user.otpLastSentAt = null;

    await user.save();

    res.status(200).json({
      message: "OTP verified successfully",
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("Verify OTP error:", error.message);

    res.status(500).json({
      message: "Server error while verifying OTP",
    });
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
};