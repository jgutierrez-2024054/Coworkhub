// controllers/authController.js
const authService = require('../services/AuthService');
const memberRepository = require('../repositories/MemberRepository');
const { ok } = require('../helpers/response');
const { issueCsrfToken } = require('../middlewares/csrf');
const { signSession } = require('../helpers/jwt');

const cookieOptions = () => ({
  httpOnly: true, // no accesible desde JS del navegador -> mitiga XSS robando la sesion
  secure: process.env.NODE_ENV === 'production', // solo HTTPS en produccion
  sameSite: 'lax', // mitiga CSRF en la mayoria de escenarios manteniendo usabilidad
  // Sin maxAge: la cookie expira cuando se cierra el navegador (sesión temporal)
  path: '/',
});

async function register(req, res, next) {
  try {
    const member = await authService.register(req.body);
    const token = signSession({ sub: member.id, role: member.role, email: member.email });
    res.cookie(process.env.COOKIE_NAME || 'cwh_session', token, cookieOptions());
    issueCsrfToken(res);
    return ok(
      res,
      { id: member.id, name: member.name, email: member.email, role: member.role },
      201
    );
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { token, member } = await authService.login(req.body);
    res.cookie(process.env.COOKIE_NAME || 'cwh_session', token, cookieOptions());
    issueCsrfToken(res);
    return ok(res, { id: member.id, name: member.name, email: member.email, role: member.role });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME || 'cwh_session', { path: '/' });
  return ok(res, { message: 'Sesion cerrada.' });
}

async function me(req, res) {
  const member = await memberRepository.findById(req.user.id);
  if (!member) {
    return ok(res, { id: req.user.id, email: req.user.email, role: req.user.role, plan: null });
  }
  return ok(res, {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role,
    plan: member.plan ? {
      id: member.plan.id,
      name: member.plan.name,
      price: member.plan.price,
      includedHours: member.plan.includedHours,
      allowedSpaceTypes: member.plan.allowedSpaceTypes,
    } : null,
  });
}

module.exports = { register, login, logout, me };
