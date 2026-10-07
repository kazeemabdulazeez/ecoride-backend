const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true},
    driverId: { type: mongoose.Schema.Types.ObjectId, required: true},
    latitude: { type: Number, required: true, min: -90, max: 90},
    longitude: { type: Number, required: true, min: -180, max: 180},
    recordedAt: { type: Date,default: Date.now}
  }, {timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);