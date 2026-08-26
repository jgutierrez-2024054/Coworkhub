// services/ReservationService.js
const reservationRepository = require('../repositories/ReservationRepository');
const spaceRepository = require('../repositories/SpaceRepository');
const memberRepository = require('../repositories/MemberRepository');
const { buildReservationChain } = require('../patterns/reservationChain');
const { DomainError } = require('../middlewares/errorHandler');

function hoursBetween(start, end) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

class ReservationService {
  async create({ memberId, spaceId, startsAt, endsAt }) {
    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new DomainError(422, 'El rango de horario no es valido.');
    }

    const member = await memberRepository.findById(memberId);
    if (!member) throw new DomainError(404, 'Miembro no encontrado.');

    // Todo el flujo (verificar solapamiento + crear la reserva) ocurre dentro
    // de UNA transaccion: o se hace todo, o no se hace nada (regla de "todo o
    // nada" del enunciado). El lock de filas evita que dos requests
    // simultaneas para el mismo espacio pasen ambas la validacion de solapamiento.
    return reservationRepository.runInTransaction(async (transaction) => {
      const space = await spaceRepository.findById(spaceId);
      if (!space) throw new DomainError(404, 'Espacio no encontrado.');

      const overlapping = await reservationRepository.findOverlapping(spaceId, start, end, {
        transaction,
      });

      const existing = await reservationRepository.sumActiveHoursInMonth(
        memberId,
        start.getUTCFullYear(),
        start.getUTCMonth() + 1,
        { transaction }
      );
      const existingHoursThisMonth = existing.reduce(
        (sum, r) => sum + hoursBetween(new Date(r.startsAt), new Date(r.endsAt)),
        0
      );
      const requestedHours = hoursBetween(start, end);

      const chain = buildReservationChain();
      await chain.check({
        space,
        plan: member.plan,
        overlapping,
        existingHoursThisMonth,
        requestedHours,
      });

      const reservation = await reservationRepository.create(
        {
          memberId,
          spaceId,
          startsAt: start,
          endsAt: end,
          hourlyRateSnapshot: space.hourlyRate,
          status: 'active',
        },
        { transaction }
      );

      return reservation;
    });
  }

  async cancel(reservationId, memberId) {
    const result = await reservationRepository.cancel(reservationId, memberId);
    if (result === null) throw new DomainError(404, 'Reserva no encontrada.');
    if (result === 'forbidden') throw new DomainError(403, 'No puedes cancelar una reserva de otro miembro.');
    return result;
  }

  async myReservations(memberId) {
    return reservationRepository.findFiltered({ memberId });
  }

  async filtered(filters) {
    return reservationRepository.findFiltered(filters);
  }
}

module.exports = new ReservationService();
