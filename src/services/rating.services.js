const Rating = require('../models/Rating');
const TripSession = require('../models/TripSession');
const Booking = require('../models/Booking');
const DriverProfile = require('../models/DriverProfile');
const { err } = require('../utils/errors');
const reliabilityService = require('./reliability.service');

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000;

async function assertParticipant(trip, userId) {
  const isDriver = String(trip.driver) === String(userId);
  if (isDriver) return { isDriver };

  const isPassenger = await Booking.exists({
    commute: trip.commute,
    passenger: userId,
    status: { $in: ['accepted', 'completed'] },
  });
  if (!isPassenger) throw err.forbidden('Not a trip participant');
  return { isPassenger: true };
}

async function createRating({ tripId, authorId, ratedUserId, score, comment, tags }) {
  const trip = await TripSession.findById(tripId);
  if (!trip) throw err.notFound('Trip not found');
  if (trip.status !== 'ended') throw err.unprocessable('Trip not ended yet');

  await assertParticipant(trip, authorId);

  if (String(ratedUserId) === String(authorId)) {
    throw err.badRequest('Cannot rate yourself');
  }

  let rating;
  try {
    rating = await Rating.create({
      tripSession: trip._id,
      author: authorId,
      ratedUser: ratedUserId,
      score,
      comment,
      tags,
    });
  } catch (e) {
    if (e.code === 11000) {
      throw err.conflict('ALREADY_RATED', 'You already rated this user for this trip');
    }
    throw e;
  }

  await syncDriverProfileAggregates(ratedUserId);
  reliabilityService.recomputeUser(ratedUserId).catch(() => {});

  return rating;
}

async function syncDriverProfileAggregates(userId) {
  const agg = await Rating.aggregate([
    { $match: { ratedUser: new (require('mongoose').Types.ObjectId)(userId) } },
    { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
  ]);
  if (!agg[0]) return;
  await DriverProfile.updateOne(
    { user: userId },
    { $set: { ratingAvg: +agg[0].avg.toFixed(2), ratingCount: agg[0].count } }
  );
}

async function listByTrip(tripId) {
  return Rating.find({ tripSession: tripId })
    .populate('author', 'fullName')
    .populate('ratedUser', 'fullName')
    .lean();
}

async function listByUser(userId, { limit = 50 } = {}) {
  const [data, agg] = await Promise.all([
    Rating.find({ ratedUser: userId })
      .populate('author', 'fullName')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Rating.aggregate([
      { $match: { ratedUser: new (require('mongoose').Types.ObjectId)(userId) } },
      { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
    ]),
  ]);
  return {
    avg: +(agg[0]?.avg ?? 0).toFixed(2),
    count: agg[0]?.count ?? 0,
    data,
  };
}

async function updateRating({ ratingId, userId, score, comment, tags }) {
  const rating = await Rating.findById(ratingId);
  if (!rating) throw err.notFound('Rating not found');
  if (String(rating.author) !== String(userId)) throw err.forbidden();

  if (Date.now() - rating.createdAt.getTime() > EDIT_WINDOW_MS) {
    throw err.unprocessable('Edit window expired');
  }

  if (score   !== undefined) rating.score = score;
  if (comment !== undefined) rating.comment = comment;
  if (tags    !== undefined) rating.tags = tags;
  await rating.save();

  await syncDriverProfileAggregates(rating.ratedUser);
  reliabilityService.recomputeUser(rating.ratedUser).catch(() => {});

  return rating;
}

async function deleteRating({ ratingId, userId }) {
  const rating = await Rating.findById(ratingId);
  if (!rating) throw err.notFound('Rating not found');
  if (String(rating.author) !== String(userId)) throw err.forbidden();

  const ratedUser = rating.ratedUser;
  await rating.deleteOne();

  await syncDriverProfileAggregates(ratedUser);
  reliabilityService.recomputeUser(ratedUser).catch(() => {});
}

module.exports = {
  createRating,
  listByTrip,
  listByUser,
  updateRating,
  deleteRating,
};