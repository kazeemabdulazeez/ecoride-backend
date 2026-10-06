const asyncHandler = require('./utils/asyncHandler');
const reportService = require('../services/report.service');

exports.create = asyncHandler(async (req, res) => {
  const { reportedUserId, tripSessionId, category, description, evidence } = req.valid.body;

  const report = await reportService.createReport({
    reporterId: req.user.id,
    reportedUserId,
    tripSessionId,
    category,
    description,
    evidence,
  });

  res.status(201).json({
    id: report._id,
    status: report.status,
    createdAt: report.createdAt,
  });
});

exports.getOne = asyncHandler(async (req, res) => {
  const report = await reportService.getReportForUser({
    reportId: req.valid.params.id,
    userId: req.user.id,
    isAdmin: req.user.role === 'admin',
  });
  res.json(report);
});

exports.listAdmin = asyncHandler(async (req, res) => {
  const result = await reportService.listReports(req.valid.query);
  res.json(result);
});

exports.updateAdmin = asyncHandler(async (req, res) => {
  const report = await reportService.updateReport({
    reportId: req.valid.params.id,
    adminId: req.user.id,
    status: req.valid.body.status,
    resolution: req.valid.body.resolution,
  });
  res.json(report);
});