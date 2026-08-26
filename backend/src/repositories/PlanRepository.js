// repositories/PlanRepository.js
const { Plan } = require('../models');

class PlanRepository {
  findAll() {
    return Plan.findAll({ order: [['id', 'ASC']] });
  }

  findById(id) {
    return Plan.findByPk(id);
  }

  create(data) {
    return Plan.create(data);
  }

  async update(id, data) {
    const plan = await Plan.findByPk(id);
    if (!plan) return null;
    await plan.update(data);
    return plan;
  }
}

module.exports = new PlanRepository();
