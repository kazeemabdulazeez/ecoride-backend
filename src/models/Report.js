const { Schema, model } = require('mongoose');
const { REPORT_CATEGORIES, REPORT_STATUSES } = require('../constants/reliability');

const reportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  reportedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  tripSession: {
    type: Schema.Types.ObjectId,
    ref: 'TripSession',
  },
  category: {
    type: String,
    enum: REPORT_CATEGORIES,
    required: true,
    index: true,
  },
  description: {
    type: String,
    maxlength: 2000,
  },
  evidence: [{
    kind:    { type: String },
    fileUrl: { type: String },
  }],
  status: {
    type: String,
    enum: REPORT_STATUSES,
    default: 'open',
    index: true,
  },
  resolution: { type: String, maxlength: 2000 },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1, status: 1 });

reportSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    reporter: this.reporter,
    reportedUser: this.reportedUser,
    tripSession: this.tripSession,
    category: this.category,
    description: this.description,
    evidence: this.evidence,
    status: this.status,
    resolution: this.resolution,
    resolvedAt: this.resolvedAt,
    createdAt: this.createdAt,
  };
};

module.exports = model('Report', reportSchema);