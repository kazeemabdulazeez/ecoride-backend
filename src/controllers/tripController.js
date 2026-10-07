const Trip = require("../models/Trip.js");

// Creating trip
const createTrip = async (req, res) => {
    try {
        const { driverId, pickup, destination } = req.body;
        if (!driverId || !pickup || !destination) {
            return res.status(400).json({
                message: "driverId, pickup and destination are required."
            });
        }
        const trip = await Trip.create({
            passengerId: req.userId, driverId, pickup, destination
        });
        return res.status(201).json({
            message: "Trip created successfully.",
            trip
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not create trip.", error: error.message
        });
    }
};

//starting trip
const startTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }
        if (
            trip.passengerId.toString() !== req.userId && trip.driverId.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not part of this trip."
            });
        }
        trip.status = "started";
        trip.startedAt = new Date();
        await trip.save();
        return res.status(200).json({
            message: "Trip started successfully.",
            trip
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not start trip.", error: error.message
        });
    }
};

//Ending trip
const endTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }

        if (trip.driverId.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the driver can end this trip."
            });
        }

        trip.status = "completed";
        trip.completedAt = new Date();

        await trip.save();

        return res.status(200).json({
            message: "Trip completed successfully.",
            trip
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not complete trip.",
            error: error.message
        });
    }
};

//Getting Trip
const getTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }
        if (
            trip.passengerId.toString() !== req.userId && trip.driverId.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not part of this trip."
            });
        }
        return res.status(200).json({
            trip
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not get trip.", error: error.message
        });
    }
};


module.exports = {
    createTrip,
    startTrip,
    endTrip,
    getTrip
};