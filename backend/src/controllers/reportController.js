const reportService = require('../services/ReportService');
const { ok, fail } = require('../helpers/response');

async function consumo(req, res, next) {
  try {
    const { memberId, month } = req.query;
    if (!memberId || !month) {
      return fail(res, 422, 'memberId y month son requeridos.');
    }
    if (req.user.role !== 'admin' && Number(memberId) !== req.user.id) {
      return fail(res, 403, 'Solo puedes consultar tu propio consumo.');
    }
    const result = await reportService.consumo(Number(memberId), month);
    return ok(res, result);
  } catch (err) { return next(err); }
}

async function reservations(req, res, next) {
  try {
    const { memberId, spaceId, from, to } = req.query;
    const result = await reportService.filtered({
      memberId: memberId ? Number(memberId) : undefined,
      spaceId: spaceId ? Number(spaceId) : undefined,
      from,
      to,
    });
    return ok(res, result);
  } catch (err) { return next(err); }
}

module.exports = { consumo, reservations };
