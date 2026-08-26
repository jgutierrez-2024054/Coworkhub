// middlewares/sanitize.js
// Defensa contra XSS: limpia cualquier string de entrada (body/query/params)
// que pudiera contener HTML/JS malicioso antes de que llegue a la logica de
// negocio o se guarde en la BD. Se complementa con helmet (headers) en app.js.
const xss = require('xss');

function deepSanitize(value) {
  if (typeof value === 'string') {
    return xss(value);
  }
  if (Array.isArray(value)) {
    return value.map(deepSanitize);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const key of Object.keys(value)) {
      clean[key] = deepSanitize(value[key]);
    }
    return clean;
  }
  return value;
}

function sanitizeInput(req, res, next) {
  if (req.body) req.body = deepSanitize(req.body);
  if (req.query) req.query = deepSanitize(req.query);
  if (req.params) req.params = deepSanitize(req.params);
  next();
}

module.exports = sanitizeInput;
