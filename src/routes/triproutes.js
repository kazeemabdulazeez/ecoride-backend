const express = require("express");
const tripRoute = express.Router();
const  authMiddleware  = require("../middleware/authMiddleware");

const {createTrip, startTrip, endTrip,getTrip} = require("../controllers/tripController");


tripRoute.post( "/", authMiddleware, createTrip);
tripRoute.patch("/:tripId/start", authMiddleware, startTrip);
tripRoute.patch("/:tripId/end", authMiddleware, endTrip);
tripRoute.get("/:tripId", authMiddleware, getTrip);

module.exports = tripRoute;

