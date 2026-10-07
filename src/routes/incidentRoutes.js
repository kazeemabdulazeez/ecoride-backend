const express = require("express");
const incidentRoute = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {reportIncident, triggerEmergency, getTripIncidents, getAllOpenIncidents, updateIncidentStatus} = require("../controllers/incidentController");

incidentRoute.post("/:tripId/report", authMiddleware, reportIncident);
incidentRoute.post("/:tripId/emergency", authMiddleware, triggerEmergency);
incidentRoute.get("/:tripId", authMiddleware, getTripIncidents);
incidentRoute.get("/admin/open", getAllOpenIncidents);
incidentRoute.patch("/admin/:incidentId/status", updateIncidentStatus);


module.exports = incidentRoute;