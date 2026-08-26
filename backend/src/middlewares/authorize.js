// middlewares/authorize.js
// Autorizacion por rol. Se usa despues de authenticate(). Un miembro que
// intenta llegar a una ruta de admin recibe 403 (no basta con esconder el boton).
const { fail } = require('../helpers/response');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return fail(res, 401, 'No autenticado.');
    }
    if (!allowedRoles.includes(req.user.role)) {
      return fail(res, 403, 'No tienes permisos para realizar esta accion.');
    }
    return next();
  };
}

module.exports = authorize;
