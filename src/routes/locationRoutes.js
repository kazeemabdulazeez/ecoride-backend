const express = require("express");
const locationRoute = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {updateLocation, getCurrentLocation, getLocationHistory} = require("../controllers/locationController");


locationRoute.post("/:tripId/location", authMiddleware, updateLocation);
locationRoute.get("/:tripId/location", authMiddleware, getCurrentLocation);
locationRoute.get("/:tripId/location/history", authMiddleware,getLocationHistory);

module.exports = locationRoute;