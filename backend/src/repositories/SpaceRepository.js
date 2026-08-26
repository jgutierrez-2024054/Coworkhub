// repositories/SpaceRepository.js
const { Space } = require('../models');

class SpaceRepository {
  findAll() {
    return Space.findAll({ order: [['id', 'ASC']] });
  }

  findActive() {
    return Space.findAll({ where: { active: true }, order: [['id', 'ASC']] });
  }

  findById(id) {
    return Space.findByPk(id);
  }

  create(data) {
    return Space.create(data);
  }

  async update(id, data) {
    const space = await Space.findByPk(id);
    if (!space) return null;
    await space.update(data);
    return space;
  }

  async deactivate(id) {
    const space = await Space.findByPk(id);
    if (!space) return null;
    space.active = false;
    await space.save();
    return space;
  }
}

module.exports = new SpaceRepository();
