const mongoose = require("mongoose");

const tripShareSchema = new mongoose.Schema(
  {
    tripId: {type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true},
    sharedBy: { type: mongoose.Schema.Types.ObjectId, required: true},
    recipientName: { type: String, required: true},
    recipientPhone: { type: String, required: true},
    shareToken: { type: String, required: true, unique: true},
    expiresAt: {type: Date, required: true},
    active: { type: Boolean, default: true}
  },  { timestamps: true}
);

module.exports = mongoose.model("TripShare", tripShareSchema);