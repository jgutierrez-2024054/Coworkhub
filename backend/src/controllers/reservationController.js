const reservationService = require('../services/ReservationService');
const { ok } = require('../helpers/response');

async function create(req, res, next) {
  try {
    const reservation = await reservationService.create({
      memberId: req.user.id,
      spaceId: req.body.spaceId,
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
    });
    return ok(res, reservation, 201);
  } catch (err) { return next(err); }
}

async function cancel(req, res, next) {
  try {
    const reservation = await reservationService.cancel(req.params.id, req.user.id);
    return ok(res, reservation);
  } catch (err) { return next(err); }
}

async function mine(req, res, next) {
  try {
    const reservations = await reservationService.myReservations(req.user.id);
    return ok(res, reservations);
  } catch (err) { return next(err); }
}

module.exports = { create, cancel, mine };
