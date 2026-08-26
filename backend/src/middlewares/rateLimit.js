// middlewares/rateLimit.js
// Rate limiting basico, mas estricto en login/registro para mitigar fuerza bruta.
const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos, intenta mas tarde.' },
});

module.exports = { generalLimiter, authLimiter };
