
require("dotenv").config();

if (
  process.env.NODE_ENV === "production" ||
  process.env.ALLOW_DEMO_DRIVER_CREATION !== "true"
) {
  throw new Error(
    "Demo driver creation is disabled. Set ALLOW_DEMO_DRIVER_CREATION=true only in an approved demo environment."
  );
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

const createDemoDriver = async () => {
  const {
    DEMO_DRIVER_FIRST_NAME,
    DEMO_DRIVER_LAST_NAME,
    DEMO_DRIVER_EMAIL,
    DEMO_DRIVER_PASSWORD,
  } = process.env;

  if (
    !DEMO_DRIVER_FIRST_NAME ||
    !DEMO_DRIVER_LAST_NAME ||
    !DEMO_DRIVER_EMAIL ||
    !DEMO_DRIVER_PASSWORD
  ) {
    throw new Error(
      "Set DEMO_DRIVER_FIRST_NAME, DEMO_DRIVER_LAST_NAME, " +
      "DEMO_DRIVER_EMAIL and DEMO_DRIVER_PASSWORD in your local .env file."
    );
  }

  if (DEMO_DRIVER_PASSWORD.length < 6) {
    throw new Error("Demo driver password must be at least 6 characters.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from your environment.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const email = DEMO_DRIVER_EMAIL.toLowerCase().trim();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error(
      "An account with this email already exists. No account was changed."
    );
  }

  const hashedPassword = await bcrypt.hash(
    DEMO_DRIVER_PASSWORD,
    10
  );

  const driver = await User.create({
    firstName: DEMO_DRIVER_FIRST_NAME.trim(),
    lastName: DEMO_DRIVER_LAST_NAME.trim(),
    email,
    password: hashedPassword,
    role: "driver",
    emailVerified: false,
  });

  console.log("Demo driver account created successfully.");
  console.log(`Driver ID: ${driver._id}`);
  console.log(`Driver email: ${driver.email}`);
  console.log("Email OTP is not required for driver login.");
};

createDemoDriver()
  .catch((error) => {
    console.error("Could not create demo driver:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
