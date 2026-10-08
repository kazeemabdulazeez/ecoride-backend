const asyncHandler = require('../utils/asyncHandler');
const reliabilityService = require('../services/reliability.service');

exports.getUser = asyncHandler(async (req, res) => {
  const doc = await reliabilityService.getOrCompute(req.valid.params.id);
  res.json(doc.toPublicJSON());
});

exports.recomputeAll = asyncHandler(async (req, res) => {
  const limit = req.body?.limit ?? 1000;
  const result = await reliabilityService.recomputeAll({ limit });
  res.json(result);
});