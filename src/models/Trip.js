const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    passengerId: { type: mongoose.Schema.Types.ObjectId, required: true},
    driverId: { type: mongoose.Schema.Types.ObjectId, required: true},
    pickup: { type: String, required: true},
    destination: { type: String, required: true},
    status: { type: String, enum: ["requested", "started", "completed", "cancelled"], default: "requested" },
    startedAt: { type: Date, default: null},
    completedAt: { type: Date, default: null}
  }, {timestamps: true}
);

module.exports = mongoose.model("Trip", tripSchema);