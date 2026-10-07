const Trip = require("../models/Trip");
const Incident = require("../models/Incident");


const reportIncident = async (req, res) => {
    try {
        const { type, description, latitude, longitude, emergency } = req.body;
        if (!type || !description) {
            return res.status(400).json({
                message: "Incident type and description are required."
            });
        }
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
        const incident = await Incident.create({
            tripId: trip._id,
            reportedBy: req.userId,
            type,
            description,
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            emergency: emergency === true
        });
        return res.status(201).json({
            message: emergency === true
                ? "Emergency incident reported."
                : "Incident reported successfully.",
            incident
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not report incident.",
            error: error.message
        });
    }
};


const triggerEmergency = async (req, res) => {
    try {
        const {description, latitude, longitude} = req.body;
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({
                message: "Trip not found."
            });
        }
        if (
            trip.passengerId.toString() !== req.userId && trip.driverId.toString() !== req.userId){
            return res.status(403).json({
                message: "You are not part of this trip."
            });
        }
        const incident = await Incident.create({
            tripId: trip._id,
            reportedBy: req.userId,
            type: "other",
            description:
                description || "Emergency assistance requested.",
            latitude: latitude ?? null,
            longitude: longitude ?? null,
            emergency: true,
            status: "open"
        });
        return res.status(201).json({
            message: "Emergency event recorded.",
            incidentId: incident._id,
            emergency: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not create emergency event.", error: error.message
        });
    }
};


const getTripIncidents = async (req, res) => {
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

        const incidents = await Incident.find({
            tripId: trip._id
        }).sort({
            createdAt: -1
        });

        return res.status(200).json({
            count: incidents.length,
            incidents
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not retrieve incidents.", error: error.message
        });
    }
};


const getAllOpenIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find({
            status: { $in: ["open", "investigating"]}
        })
            .populate("tripId")
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            count: incidents.length,
            incidents
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not retrieve incidents.", error: error.message
        });
    }
};


const updateIncidentStatus = async (req, res) => {
    try {
        const {
            status
        } = req.body;

        if (!["open", "investigating", "resolved"].includes(status)){
            return res.status(400).json({
                message: "Invalid incident status."
            });
        }
        const incident = await Incident.findById(
            req.params.incidentId
        );
        if (!incident) {
            return res.status(404).json({
                message: "Incident not found."
            });
        }
        incident.status = status;
        if (status === "resolved") {
            incident.resolvedAt = new Date();
        }
        await incident.save();
        return res.status(200).json({
            message: "Incident status updated.",
            incident
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not update incident status.", error: error.message
        });
    }
};


module.exports = {
    reportIncident,
    triggerEmergency,
    getTripIncidents,
    getAllOpenIncidents,
    updateIncidentStatus
};