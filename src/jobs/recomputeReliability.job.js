const { recomputeAll } = require('../services/reliability.service');

/**
 * Nightly job: recompute reliability scores for all users.
 * Register in src/jobs/index.js with cron.schedule('0 3 * * *', ...)
 */
module.exports = async function recomputeReliabilityJob() {
  const start = Date.now();
  try {
    const result = await recomputeAll({ limit: 10000 });
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(`[recomputeReliability] processed=${result.processed} failed=${result.failed} ms=${ms}`);
    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[recomputeReliability] error', e);
    throw e;
  }
};