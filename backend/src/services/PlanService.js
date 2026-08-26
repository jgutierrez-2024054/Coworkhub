// services/PlanService.js
const planRepository = require('../repositories/PlanRepository');
const { DomainError } = require('../middlewares/errorHandler');

class PlanService {
  list() {
    return planRepository.findAll();
  }

  create(data) {
    return planRepository.create(data);
  }

  async update(id, data) {
    const updated = await planRepository.update(id, data);
    if (!updated) throw new DomainError(404, 'Plan no encontrado.');
    return updated;
  }

  async getOrFail(id) {
    const plan = await planRepository.findById(id);
    if (!plan) throw new DomainError(404, 'Plan no encontrado.');
    return plan;
  }
}

module.exports = new PlanService();
