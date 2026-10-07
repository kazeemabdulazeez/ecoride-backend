const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true},
    reportedBy: { type: mongoose.Schema.Types.ObjectId, required: true},
    type: {type: String,
      enum: [
        "accident",
        "harassment",
        "unsafe_driving",
        "medical_emergency",
        "vehicle_problem",
        "other"
      ],required: true
},
    description: { type: String, required: true, maxlength: 1000},
    latitude: { type: Number, min: -90, max: 90, default: null},
    longitude: { type: Number, min: -180, max: 180, default: null},
    emergency: { type: Boolean, default: false},
    status: { type: String,enum: ["open","investigating","resolved"], default: "open"},
    resolvedAt: { type: Date, default: null}
  }, { timestamps: true}
);

module.exports = mongoose.model("Incident", incidentSchema);