require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`EcoRide backend running on port ${PORT}`);
});