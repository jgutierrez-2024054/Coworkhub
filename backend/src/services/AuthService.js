// services/AuthService.js
const memberRepository = require('../repositories/MemberRepository');
const { hashPassword, comparePassword } = require('../helpers/password');
const { signSession } = require('../helpers/jwt');
const { DomainError } = require('../middlewares/errorHandler');

class AuthService {
  async register({ name, email, password }) {
    const existing = await memberRepository.findByEmail(email);
    if (existing) {
      throw new DomainError(409, 'Ya existe una cuenta con ese correo.');
    }
    const passwordHash = await hashPassword(password);
    const member = await memberRepository.create({
      name,
      email,
      passwordHash,
      role: 'member',
      planId: null,
    });
    return member;
  }

  async login({ email, password }) {
    const member = await memberRepository.findByEmail(email);
    if (!member) {
      throw new DomainError(401, 'Credenciales incorrectas.');
    }
    const validPassword = await comparePassword(password, member.passwordHash);
    if (!validPassword) {
      throw new DomainError(401, 'Credenciales incorrectas.');
    }
    const token = signSession({ sub: member.id, role: member.role, email: member.email });
    return { token, member };
  }
}

module.exports = new AuthService();
