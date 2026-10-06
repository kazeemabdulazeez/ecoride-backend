const router = require('express').Router();
const controller = require('../controllers/report.controller');
const validate = require('../middleware/validate');
const { requireRole } = require('../middleware/auth');
const {
  createReportSchema,
  listReportsSchema,
  updateReportSchema,
  reportParams,
} = require('../validators/report.schema');

// Authenticated user routes
router.post('/reports', validate(createReportSchema), controller.create);
router.get('/reports/:id', validate(reportParams), controller.getOne);

// Admin routes
router.get(
  '/admin/reports',
  requireRole('admin'),
  validate(listReportsSchema),
  controller.listAdmin
);
router.patch(
  '/admin/reports/:id',
  requireRole('admin'),
  validate(updateReportSchema),
  controller.updateAdmin
);

module.exports = router;