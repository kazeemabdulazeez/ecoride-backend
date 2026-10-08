const router = require('express').Router();
const controller = require('../controllers/reliability.controller');
const validate = require('../middleware/validate');
const { requireRole } = require('../middleware/auth');
const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const userParams = z.object({ params: z.object({ id: objectId }) });
const recomputeBody = z.object({
  body: z.object({
    limit: z.number().int().min(1).max(10000).optional(),
  }).strict(),
});

// Public read
router.get('/users/:id/reliability', validate(userParams), controller.getUser);

// Admin bulk recompute
router.post(
  '/admin/reliability/recompute',
  requireRole('admin'),
  validate(recomputeBody),
  controller.recomputeAll
);

module.exports = router;