const axios = require("axios");

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

/**
 * Initialize a Paystack transaction.
 */
const initializeTransaction = async ({
  email,
  amount,
  reference,
  callbackUrl,
}) => {
  if (!email) {
    throw new Error("Customer email is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("A valid payment amount is required.");
  }

  if (!reference) {
    throw new Error("Payment reference is required.");
  }

  const payload = {
    email,
    amount: Math.round(amount * 100),
    reference,
  };

  if (callbackUrl) {
    payload.callback_url = callbackUrl;
  }

  const response = await paystack.post(
    "/transaction/initialize",
    payload
  );

  return response.data.data;
};

/**
 * Verify a Paystack transaction.
 */
const verifyTransaction = async (reference) => {
  if (!reference) {
    throw new Error("Payment reference is required.");
  }

  const response = await paystack.get(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  return response.data.data;
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
};