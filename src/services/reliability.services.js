const mongoose = require('mongoose');
const User = require('../models/User');
const Rating = require('../models/Rating');
const Report = require('../models/Report');
const Incident = require('../models/Incident');
const Booking = require('../models/Booking');
const TripSession = require('../models/TripSession');
const ReliabilityScore = require('../models/ReliabilityScore');
const { WEIGHTS, TIER, TIER_THRESHOLDS } = require('../constants/reliability');
const { err } = require('../utils/errors');

function tierFor(score) {
  if (score >= TIER_THRESHOLDS.trusted)  return TIER.TRUSTED;
  if (score >= TIER_THRESHOLDS.standard) return TIER.STANDARD;
  return TIER.AT_RISK;
}

async function computeFactors(userId) {
  const uid = new mongoose.Types.ObjectId(userId);

  const [
    bookingsTotal,
    bookingsCompleted,
    bookingsCancelled,
    bookingsNoShow,
    tripsCompleted,
    ratingAgg,
    incidentsOpen,
    incidentsResolved,
    reportsUpheld,
  ] = await Promise.all([
    Booking.countDocuments({ passenger: uid, status: { $in: ['completed', 'cancelled'] } }),
    Booking.countDocuments({ passenger: uid, status: 'completed' }),
    Booking.countDocuments({ passenger: uid, status: 'cancelled' }),
    Booking.countDocuments({ passenger: uid, status: 'cancelled', cancelReason: 'no_show' }),
    TripSession.countDocuments({ driver: uid, status: 'ended' }),
    Rating.aggregate([
      { $match: { ratedUser: uid } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
    ]),
    Incident.countDocuments({ reportedUser: uid, status: { $in: ['open', 'reviewing'] } }),
    Incident.countDocuments({ reportedUser: uid, status: 'resolved' }),
    Report.countDocuments({ reportedUser: uid, status: 'resolved' }),
  ]);

  return {
    bookingsTotal,
    bookingsCompleted,
    bookingsCancelled,
    bookingsNoShow,
    tripsCompleted,
    avgRating:         ratingAgg[0]?.avg   ?? 0,
    ratingCount:       ratingAgg[0]?.count ?? 0,
    incidentsOpen,
    incidentsResolved,
    reportsUpheld,
  };
}

function scoreFromFactors(f) {
  const denom = (f.bookingsCompleted + f.bookingsCancelled) || 1;
  const completion = f.bookingsCompleted / denom;

  const noShow = 1 - Math.min(1, (f.bookingsNoShow / Math.max(1, f.bookingsTotal)) * 3);

  const rating = f.ratingCount === 0 ? 0.75 : (f.avgRating - 1) / 4;

  const incidents = 1 - Math.min(1, f.incidentsOpen * 0.4 + f.incidentsResolved * 0.1);

  const reports = 1 - Math.min(1, f.reportsUpheld * 0.25);

  const score =
    completion * WEIGHTS.completion +
    noShow     * WEIGHTS.noShow     +
    rating     * WEIGHTS.rating     +
    incidents  * WEIGHTS.incidents  +
    reports    * WEIGHTS.reports;

  return Math.max(0, Math.min(1, score));
}

async function recomputeUser(userId) {
  const exists = await User.exists({ _id: userId });
  if (!exists) throw err.notFound('User not found');

  const raw = await computeFactors(userId);
  const score = +scoreFromFactors(raw).toFixed(3);

  const factors = {
    completedTrips:    raw.tripsCompleted + raw.bookingsCompleted,
    cancellations:     raw.bookingsCancelled,
    noShows:           raw.bookingsNoShow,
    avgRating:         +raw.avgRating.toFixed(2),
    ratingCount:       raw.ratingCount,
    incidentsOpen:     raw.incidentsOpen,
    incidentsResolved: raw.incidentsResolved,
    reportsUpheld:     raw.reportsUpheld,
  };

  const doc = await ReliabilityScore.findOneAndUpdate(
    { user: userId },
    { $set: { score, tier: tierFor(score), factors, lastComputedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc;
}

async function getOrCompute(userId) {
  const existing = await ReliabilityScore.findOne({ user: userId });
  if (existing) return existing;
  return recomputeUser(userId);
}

async function recomputeAll({ limit = 5000 } = {}) {
  const users = await User.find({ role: { $in: ['passenger', 'driver'] } })
    .select('_id')
    .limit(limit)
    .lean();

  let processed = 0;
  let failed = 0;

  for (const u of users) {
    try {
      await recomputeUser(u._id);
      processed++;
    } catch (e) {
      failed++;
    }
  }
  return { processed, failed, total: users.length };
}

module.exports = {
  tierFor,
  computeFactors,
  scoreFromFactors,
  recomputeUser,
  getOrCompute,
  recomputeAll,
};