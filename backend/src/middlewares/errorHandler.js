// middlewares/errorHandler.js
// Manejo centralizado de errores: la app nunca muestra un stack trace al usuario.
const { fail } = require('../helpers/response');

// Error de dominio controlado (ej: solapamiento, limite de plan).
class DomainError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function notFoundHandler(req, res) {
  return fail(res, 404, 'Recurso no encontrado.');
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof DomainError) {
    return fail(res, err.status, err.message);
  }

  // Errores conocidos de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, 409, 'El recurso ya existe (conflicto de unicidad).');
  }
  if (err.name === 'SequelizeValidationError') {
    return fail(res, 422, 'Datos invalidos.', err.errors?.map((e) => e.message));
  }

  console.error('[ERROR]', err); // log interno, nunca expuesto al cliente
  return fail(res, 500, 'Ocurrio un error inesperado. Intenta de nuevo mas tarde.');
}

module.exports = { errorHandler, notFoundHandler, DomainError };
