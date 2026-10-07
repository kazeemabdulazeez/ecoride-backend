const crypto = require("crypto");

const Trip = require("../models/Trip");
const TripShare = require("../models/TripShares.js");


const createTripShare = async (req, res) => {
    try {
        const { recipientName, recipientPhone } = req.body;

        if (!recipientName || !recipientPhone) {
            return res.status(400).json({
                message: "Recipient name and phone are required."
            });
        }
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }
        if (trip.passengerId.toString() !== req.userId) {
            return res.status(403).json({
                message: "Only the passenger can share this trip."
            });
        }

        const shareToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );
        const share = await TripShare.create({
            tripId: trip._id,
            sharedBy: req.userId,
            recipientName,
            recipientPhone,
            shareToken,
            expiresAt
        });
        return res.status(201).json({
            message: "Trip sharing link created.",
            shareId: share._id,
            shareToken: share.shareToken,
            expiresAt: share.expiresAt
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not create trip share.",
            error: error.message
        });
    }
};


const getSharedTrip = async (req, res) => {
    try {
        const share = await TripShare.findOne({
            shareToken: req.params.token,
            active: true
        }).populate("tripId");

        if (!share) {
            return res.status(404).json({
                message: "Trip share not found."
            });
        }
        if (new Date() > share.expiresAt) {
            return res.status(410).json({
                message: "This trip sharing link has expired."
            });
        }
        const trip = share.tripId;

        return res.status(200).json({
            message: "Shared trip information.",
            trip: {
                id: trip._id,
                pickup: trip.pickup,
                destination: trip.destination,
                status: trip.status
            },
            sharedWith: share.recipientName,
            expiresAt: share.expiresAt
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not retrieve shared trip.",
            error: error.message
        });
    }
};


const deactivateTripShare = async (req, res) => {
    try {
        const share = await TripShare.findById(req.params.shareId);
        if (!share) {
            return res.status(404).json({
                message: "Share not found."
            });
        }
        if (share.sharedBy.toString() !== req.userId) {
            return res.status(403).json({
                message: "You cannot deactivate this share."
            });
        }
        share.active = false;
        await share.save();

        return res.status(200).json({
            message: "Trip share deactivated."
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not deactivate trip share.",
            error: error.message
        });
    }
};


module.exports = {
    createTripShare,
    getSharedTrip,
    deactivateTripShare
};