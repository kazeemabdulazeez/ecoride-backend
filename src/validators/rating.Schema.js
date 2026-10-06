const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const createRatingBody = z.object({
  ratedUserId: objectId,
  score:       z.number().int().min(1).max(5),
  comment:     z.string().max(1000).optional(),
  tags:        z.array(z.string().min(1).max(40)).max(10).optional(),
}).strict();

const updateRatingBody = z.object({
  score:   z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
  tags:    z.array(z.string().min(1).max(40)).max(10).optional(),
}).strict();

const tripParams = z.object({ tripId: objectId });
const ratingParams = z.object({ id: objectId });
const userParams = z.object({ id: objectId });

module.exports = {
  createRatingSchema: z.object({ body: createRatingBody, params: tripParams }),
  updateRatingSchema: z.object({ body: updateRatingBody, params: ratingParams }),
  tripRatingsSchema:  z.object({ params: tripParams }),
  userRatingsSchema:  z.object({ params: userParams }),
};