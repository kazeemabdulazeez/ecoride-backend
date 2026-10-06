const Report = require('../models/Report');
const TripSession = require('../models/TripSession');
const { err } = require('../utils/errors');
const reliabilityService = require('./reliability.service');

async function createReport({ reporterId, reportedUserId, tripSessionId, category, description, evidence }) {
  if (!category) throw err.badRequest('category required');
  if (String(reporterId) === String(reportedUserId)) {
    throw err.badRequest('Cannot report yourself');
  }

  if (tripSessionId) {
    const trip = await TripSession.findById(tripSessionId);
    if (!trip) throw err.notFound('Trip session not found');
  }

  const report = await Report.create({
    reporter: reporterId,
    reportedUser: reportedUserId,
    tripSession: tripSessionId,
    category,
    description,
    evidence,
  });

  return report;
}

async function getReportForUser({ reportId, userId, isAdmin }) {
  const report = await Report.findById(reportId)
    .populate('reportedUser', 'fullName email')
    .populate('reporter', 'fullName email');

  if (!report) throw err.notFound('Report not found');

  const isOwner = String(report.reporter._id ?? report.reporter) === String(userId);
  if (!isOwner && !isAdmin) throw err.forbidden();

  return report;
}

async function listReports({ status, category, page = 1, limit = 20 }) {
  const q = {};
  if (status)   q.status = status;
  if (category) q.category = category;

  const [data, total] = await Promise.all([
    Report.find(q)
      .populate('reporter', 'fullName email')
      .populate('reportedUser', 'fullName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Report.countDocuments(q),
  ]);

  return { data, meta: { page, limit, total } };
}

async function updateReport({ reportId, adminId, status, resolution }) {
  if (!['reviewing', 'resolved', 'dismissed'].includes(status)) {
    throw err.badRequest('Invalid status');
  }

  const closed = ['resolved', 'dismissed'].includes(status);

  const report = await Report.findByIdAndUpdate(
    reportId,
    {
      $set: {
        status,
        resolution,
        resolvedBy: closed ? adminId : undefined,
        resolvedAt: closed ? new Date() : undefined,
      },
    },
    { new: true }
  );

  if (!report) throw err.notFound('Report not found');

  if (status === 'resolved' && report.reportedUser) {
    reliabilityService.recomputeUser(report.reportedUser).catch(() => {});
  }

  return report;
}

module.exports = {
  createReport,
  getReportForUser,
  listReports,
  updateReport,
};