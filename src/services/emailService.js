const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_EMAIL,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

async function sendOtpEmail(to, otp) {
  return transporter.sendMail({
    from: `"EcoRide" <${process.env.GOOGLE_EMAIL}>`,
    to,
    subject: "Your EcoRide Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>EcoRide Email Verification</h2>
        <p>Your verification code is:</p>
        <h1>${otp}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
