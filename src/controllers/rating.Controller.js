const asyncHandler = require('../utils/asyncHandler');
const ratingService = require('../services/rating.service');

exports.create = asyncHandler(async (req, res) => {
  const { tripId } = req.valid.params;
  const { ratedUserId, score, comment, tags } = req.valid.body;

  const rating = await ratingService.createRating({
    tripId,
    authorId: req.user.id,
    ratedUserId,
    score,
    comment,
    tags,
  });

  res.status(201).json({
    id: rating._id,
    score: rating.score,
    createdAt: rating.createdAt,
  });
});

exports.listByTrip = asyncHandler(async (req, res) => {
  const data = await ratingService.listByTrip(req.valid.params.tripId);
  res.json({ data });
});

exports.listByUser = asyncHandler(async (req, res) => {
  const result = await ratingService.listByUser(req.valid.params.id);
  res.json(result);
});

exports.update = asyncHandler(async (req, res) => {
  const rating = await ratingService.updateRating({
    ratingId: req.valid.params.id,
    userId: req.user.id,
    ...req.valid.body,
  });
  res.json(rating.toPublicJSON ? rating.toPublicJSON() : rating);
});

exports.remove = asyncHandler(async (req, res) => {
  await ratingService.deleteRating({
    ratingId: req.valid.params.id,
    userId: req.user.id,
  });
  res.status(204).end();
});