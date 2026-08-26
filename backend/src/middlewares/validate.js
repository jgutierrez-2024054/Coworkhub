// middlewares/validate.js
// Middleware generico de validacion de entrada usando esquemas Zod.
// El servidor NUNCA confia solo en la validacion del front.
const { fail } = require('../helpers/response');

function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return fail(res, 422, 'Datos de entrada invalidos.', details);
    }
    req[source] = result.data;
    return next();
  };
}

module.exports = validate;
