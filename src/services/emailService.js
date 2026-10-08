const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

async function sendOtpEmail(to, otp) {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>EcoRide Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  `;

  const message = [
    `From: EcoRide <${process.env.GOOGLE_EMAIL}>`,
    `To: ${to}`,
    "Subject: Your EcoRide Verification Code",
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\r\n");

  const encodedMessage = Buffer.from(message).toString("base64url");

  return gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
}

module.exports = { sendOtpEmail };
