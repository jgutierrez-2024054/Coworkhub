// middlewares/csrf.js
// Proteccion CSRF con patron "double-submit cookie": al hacer login se entrega
// un token CSRF en una cookie NO httpOnly (el front SI puede leerla) y el front
// debe reenviarlo en el header X-CSRF-Token en cada peticion que modifica datos.
// Un sitio atacante puede hacer que el navegador mande la cookie de sesion
// automaticamente, pero no puede leer la cookie CSRF de nuestro dominio para
// copiarla al header (misma-origen), asi que la peticion falsificada falla.
const crypto = require('crypto');
const { fail } = require('../helpers/response');

const CSRF_COOKIE = 'cwh_csrf';

function issueCsrfToken(res) {
  const token = crypto.randomBytes(24).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  });
  return token;
}

function verifyCsrf(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  // El endpoint de seed, login/register y selección de primer plan quedan fuera del chequeo.
  if (req.path.startsWith('/test') || req.path === '/auth/login' || req.path === '/auth/register' || req.path === '/members/me/plan') {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.get('X-CSRF-Token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return fail(res, 403, 'Token CSRF invalido o ausente.');
  }
  return next();
}

module.exports = { issueCsrfToken, verifyCsrf, CSRF_COOKIE };
