// repositories/MemberRepository.js
// Patron Repository: aisla el acceso a datos (Sequelize) del resto de la app.
// Los servicios no saben que hay un ORM ni MySQL detras; solo hablan con este contrato.
const { Member, Plan } = require('../models');

class MemberRepository {
  findByEmail(email) {
    return Member.findOne({ where: { email }, include: [{ model: Plan, as: 'plan' }] });
  }

  findById(id) {
    return Member.findByPk(id, { include: [{ model: Plan, as: 'plan' }] });
  }

  findAll() {
    return Member.findAll({ include: [{ model: Plan, as: 'plan' }], order: [['id', 'ASC']] });
  }

  create(data) {
    return Member.create(data);
  }

  async updatePlan(memberId, planId) {
    const member = await Member.findByPk(memberId);
    if (!member) return null;
    member.planId = planId;
    await member.save();
    return member;
  }

  async delete(id) {
    const member = await Member.findByPk(id);
    if (!member) return null;
    await member.destroy();
    return member;
  }
}

module.exports = new MemberRepository();
