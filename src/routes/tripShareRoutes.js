const express = require("express");
const tripShareRoute = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { createTripShare, getSharedTrip, deactivateTripShare} = require("../controllers/tripShareController");

tripShareRoute.post("/:tripId/share", authMiddleware, createTripShare);
tripShareRoute.get("/shared/:token", getSharedTrip);
tripShareRoute.delete("/share/:shareId", authMiddleware, deactivateTripShare);

module.exports = tripShareRoute;