// helpers/response.js
// Formato de respuesta consistente en toda la API.
function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, status, message, details) {
  return res.status(status).json({ success: false, message, details: details || undefined });
}

module.exports = { ok, fail };
