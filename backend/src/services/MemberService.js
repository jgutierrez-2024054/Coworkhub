// services/MemberService.js
const memberRepository = require('../repositories/MemberRepository');
const planRepository = require('../repositories/PlanRepository');
const { DomainError } = require('../middlewares/errorHandler');

class MemberService {
  list() {
    return memberRepository.findAll();
  }

  async getOrFail(id) {
    const member = await memberRepository.findById(id);
    if (!member) throw new DomainError(404, 'Miembro no encontrado.');
    return member;
  }

  async assignPlan(memberId, planId) {
    const plan = await planRepository.findById(planId);
    if (!plan) throw new DomainError(404, 'Plan no encontrado.');
    const member = await memberRepository.updatePlan(memberId, planId);
    if (!member) throw new DomainError(404, 'Miembro no encontrado.');
    return member;
  }

  async delete(id) {
    const member = await memberRepository.findById(id);
    if (!member) throw new DomainError(404, 'Miembro no encontrado.');
    await memberRepository.delete(id);
    return member;
  }
}

module.exports = new MemberService();
