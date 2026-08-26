const spaceService = require('../services/SpaceService');
const { ok } = require('../helpers/response');

async function list(req, res, next) {
  try {
    const spaces = await spaceService.list();
    return ok(res, spaces);
  } catch (err) { return next(err); }
}

async function listAvailable(req, res, next) {
  try {
    const spaces = await spaceService.listAvailable();
    return ok(res, spaces);
  } catch (err) { return next(err); }
}

async function create(req, res, next) {
  try {
    const space = await spaceService.create(req.body);
    return ok(res, space, 201);
  } catch (err) { return next(err); }
}

async function update(req, res, next) {
  try {
    const space = await spaceService.update(req.params.id, req.body);
    return ok(res, space);
  } catch (err) { return next(err); }
}

async function deactivate(req, res, next) {
  try {
    const space = await spaceService.deactivate(req.params.id);
    return ok(res, space);
  } catch (err) { return next(err); }
}

module.exports = { list, listAvailable, create, update, deactivate };
