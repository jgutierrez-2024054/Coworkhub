// repositories/ReservationRepository.js
const { Op } = require('sequelize');
const { sequelize, Reservation, Member, Space } = require('../models');

class ReservationRepository {
  // Busca reservas activas del mismo espacio que se solapen con [startsAt, endsAt).
  // Se ejecuta DENTRO de una transaccion con lock de filas para evitar condiciones
  // de carrera (dos requests casi simultaneas reservando el mismo hueco).
  findOverlapping(spaceId, startsAt, endsAt, { transaction } = {}) {
    return Reservation.findAll({
      where: {
        spaceId,
        status: 'active',
        startsAt: { [Op.lt]: endsAt },
        endsAt: { [Op.gt]: startsAt },
      },
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined,
    });
  }

  sumActiveHoursInMonth(memberId, year, month, { transaction } = {}) {
    const monthStart = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 1));
    return Reservation.findAll({
      where: {
        memberId,
        status: 'active',
        startsAt: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
      },
      transaction,
    });
  }

  create(data, { transaction } = {}) {
    return Reservation.create(data, { transaction });
  }

  async findById(id) {
    return Reservation.findByPk(id);
  }

  async cancel(id, memberId) {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return null;
    if (reservation.memberId !== memberId) return 'forbidden';
    reservation.status = 'cancelled';
    await reservation.save();
    return reservation;
  }

  // Reporte filtrado por miembro / espacio / rango de fechas. El indice
  // (space_id, starts_at, ends_at) y (member_id, starts_at) hace esto rapido
  // aunque haya miles de reservas acumuladas.
  findFiltered({ memberId, spaceId, from, to }) {
    const where = {};
    if (memberId) where.memberId = memberId;
    if (spaceId) where.spaceId = spaceId;
    if (from || to) {
      where.startsAt = {};
      if (from) where.startsAt[Op.gte] = new Date(from);
      if (to) where.startsAt[Op.lte] = new Date(to);
    }
    return Reservation.findAll({
      where,
      include: [
        { model: Member, as: 'member', attributes: ['id', 'name', 'email'] },
        { model: Space, as: 'space', attributes: ['id', 'name', 'type'] },
      ],
      order: [['startsAt', 'DESC']],
    });
  }

  runInTransaction(work) {
    return sequelize.transaction(work);
  }
}

module.exports = new ReservationRepository();
