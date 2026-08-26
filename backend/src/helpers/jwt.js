// helpers/jwt.js
// Firma y verifica el token de sesion que viaja dentro de la cookie httpOnly.
const jwt = require('jsonwebtoken');

function signSession(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

function verifySession(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signSession, verifySession };
