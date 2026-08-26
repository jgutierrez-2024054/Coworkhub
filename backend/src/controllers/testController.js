// controllers/testController.js
// Expone POST /test/seed para que las pruebas de caja negra dejen la BD en
// un estado conocido antes de correr. Deshabilitado fuera de development/test
// por seguridad (no queremos poder resetear datos reales en produccion).
const runSeed = require('../seed');
const { ok, fail } = require('../helpers/response');

async function seed(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    return fail(res, 403, 'Seed deshabilitado en produccion.');
  }
  try {
    const summary = await runSeed();
    return ok(res, summary);
  } catch (err) {
    return next(err);
  }
}

module.exports = { seed };
