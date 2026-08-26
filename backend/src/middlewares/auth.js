// middlewares/auth.js
// Protege rutas privadas leyendo la sesion desde la cookie httpOnly (NUNCA desde
// localStorage ni headers manejados por el cliente). Si no hay sesion valida -> 401.
const { verifySession } = require('../helpers/jwt');
const { fail } = require('../helpers/response');

function authenticate(req, res, next) {
  const token = req.cookies?.[process.env.COOKIE_NAME || 'cwh_session'];

  if (!token) {
    return fail(res, 401, 'No autenticado: se requiere iniciar sesion.');
  }

  try {
    const payload = verifySession(token);
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    return next();
  } catch (err) {
    return fail(res, 401, 'Sesion invalida o expirada.');
  }
}

module.exports = authenticate;
