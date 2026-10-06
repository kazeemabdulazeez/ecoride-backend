const { z } = require('zod');
const { REPORT_CATEGORIES, REPORT_STATUSES } = require('../constants/reliability');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const createReportBody = z.object({
  reportedUserId: objectId,
  tripSessionId:  objectId.optional(),
  category:       z.enum(REPORT_CATEGORIES),
  description:    z.string().max(2000).optional(),
  evidence: z.array(z.object({
    kind:    z.string().min(1).max(40),
    fileUrl: z.string().url(),
  })).max(5).optional(),
}).strict();

const listReportsQuery = z.object({
  status:   z.enum(REPORT_STATUSES).optional(),
  category: z.enum(REPORT_CATEGORIES).optional(),
  page:     z.coerce.number().int().min(1).default(1),
  limit:    z.coerce.number().int().min(1).max(100).default(20),
});

const updateReportBody = z.object({
  status:     z.enum(['reviewing', 'resolved', 'dismissed']),
  resolution: z.string().max(2000).optional(),
}).strict();

const objectIdParams = z.object({ id: objectId });

module.exports = {
  createReportSchema: z.object({ body: createReportBody }),
  listReportsSchema:  z.object({ query: listReportsQuery }),
  updateReportSchema: z.object({ body: updateReportBody, params: objectIdParams }),
  reportParams:       z.object({ params: objectIdParams }),
};