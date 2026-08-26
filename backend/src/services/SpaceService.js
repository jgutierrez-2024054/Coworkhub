// services/SpaceService.js
const spaceRepository = require('../repositories/SpaceRepository');
const { DomainError } = require('../middlewares/errorHandler');

class SpaceService {
  list() {
    return spaceRepository.findAll();
  }

  listAvailable() {
    return spaceRepository.findActive();
  }

  create(data) {
    return spaceRepository.create(data);
  }

  async update(id, data) {
    const updated = await spaceRepository.update(id, data);
    if (!updated) throw new DomainError(404, 'Espacio no encontrado.');
    return updated;
  }

  async deactivate(id) {
    const space = await spaceRepository.deactivate(id);
    if (!space) throw new DomainError(404, 'Espacio no encontrado.');
    return space;
  }

  async getOrFail(id) {
    const space = await spaceRepository.findById(id);
    if (!space) throw new DomainError(404, 'Espacio no encontrado.');
    return space;
  }
}

module.exports = new SpaceService();
