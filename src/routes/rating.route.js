const router = require('express').Router();
const controller = require('../controllers/rating.controller');
const validate = require('../middleware/validate');
const {
  createRatingSchema,
  updateRatingSchema,
  tripRatingsSchema,
  userRatingsSchema,
} = require('../validators/rating.schema');

router.post('/trips/:tripId/ratings', validate(createRatingSchema), controller.create);
router.get('/trips/:tripId/ratings',  validate(tripRatingsSchema),  controller.listByTrip);

router.get('/users/:id/ratings',      validate(userRatingsSchema),  controller.listByUser);

router.patch('/ratings/:id',          validate(updateRatingSchema), controller.update);
router.delete('/ratings/:id',         validate(updateRatingSchema), controller.remove);

module.exports = router;