const { Schema, model } = require('mongoose');
const { TIER } = require('../constants/reliability');

const reliabilitySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  score: {
    type: Number,
    min: 0,
    max: 1,
    default: 1.0,
  },
  tier: {
    type: String,
    enum: Object.values(TIER),
    default: TIER.STANDARD,
    index: true,
  },
  factors: {
    completedTrips:    { type: Number, default: 0 },
    cancellations:     { type: Number, default: 0 },
    noShows:           { type: Number, default: 0 },
    avgRating:         { type: Number, default: 0 },
    ratingCount:       { type: Number, default: 0 },
    incidentsOpen:     { type: Number, default: 0 },
    incidentsResolved: { type: Number, default: 0 },
    reportsUpheld:     { type: Number, default: 0 },
  },
  lastComputedAt: { type: Date, default: Date.now },
}, { timestamps: true });

reliabilitySchema.methods.toPublicJSON = function () {
  return {
    userId: this.user,
    score: this.score,
    tier: this.tier,
    factors: this.factors,
    updatedAt: this.lastComputedAt,
  };
};

module.exports = model('ReliabilityScore', reliabilitySchema);