const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto').max(120),
  email: z.string().email('Correo invalido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Correo invalido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

module.exports = { registerSchema, loginSchema };
