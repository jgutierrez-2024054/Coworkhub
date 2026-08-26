const planService = require('../services/PlanService');
const { ok } = require('../helpers/response');

async function list(req, res, next) {
  try {
    const plans = await planService.list();
    return ok(res, plans);
  } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const plan = await planService.create(req.body);
    return ok(res, plan, 201);
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    const plan = await planService.update(req.params.id, req.body);
    return ok(res, plan);
  } catch (err) { return next(err); }
}

module.exports = { list, create, update };
