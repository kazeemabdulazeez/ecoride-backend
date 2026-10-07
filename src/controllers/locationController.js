const Trip = require("../models/Trip");
const Location = require("../models/Location");

const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        if (latitude === undefined ||  longitude === undefined){
            return res.status(400).json({
                message: "Latitude and longitude are required."
            });
        }
        if ( typeof latitude !== "number" || typeof longitude !== "number"){
            return res.status(400).json({
                message: "Latitude and longitude must be numbers."
            });
        }
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }
        if (trip.driverId.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the driver can update the trip location."
            });
        }
        if (trip.status !== "started") {
            return res.status(400).json({
                message: "Trip is not currently active."
            });
        }
        const location = await Location.create({
            tripId: trip._id, driverId: req.userId, latitude, longitude
        });
        return res.status(201).json({
            message: "Location updated successfully.",
            location
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not update location.",
            error: error.message
        });
    }
};

//Getting current location
const getCurrentLocation = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }
        if (trip.passengerId.toString() !== req.userId && trip.driverId.toString() !== req.userId){
            return res.status(403).json({
                message: "You are not part of this trip."
            });
        }
        const location = await Location.findOne({
            tripId: trip._id
        }).sort({
            recordedAt: -1
        });
        if (!location){
            return res.status(404).json({
                message: "No location has been recorded yet."
            });
        }
        return res.status(200).json({
            location
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not get current location.",
            error: error.message
        });
    }
};

//Location History
const getLocationHistory = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }
        if (trip.passengerId.toString() !== req.userId && trip.driverId.toString() !== req.userId){
            return res.status(403).json({
                message: "You are not part of this trip."
            });
        }
        const locations = await Location.find({
            tripId: trip._id
        }).sort({
            recordedAt: 1
        });

        return res.status(200).json({
            count: locations.length,
            locations
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not get location history.",
            error: error.message
        });
    }
};


module.exports = {
    updateLocation,
    getCurrentLocation,
    getLocationHistory
};