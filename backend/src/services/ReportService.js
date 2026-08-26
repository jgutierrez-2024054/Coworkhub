// services/ReportService.js
const reservationRepository = require('../repositories/ReservationRepository');
const memberRepository = require('../repositories/MemberRepository');
const { DomainError } = require('../middlewares/errorHandler');

function hoursBetween(start, end) {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
}

class ReportService {
  // Consumo/facturacion mensual: horas y monto calculados EXACTAMENTE a partir
  // de las reservas activas reales del mes (tarifa congelada al momento de
  // reservar, para que la factura cuadre aunque la tarifa del espacio cambie despues).
  async consumo(memberId, monthStr) {
    const member = await memberRepository.findById(memberId);
    if (!member) throw new DomainError(404, 'Miembro no encontrado.');

    const [year, month] = monthStr.split('-').map(Number);
    if (!year || !month) throw new DomainError(422, 'El parametro month debe tener formato YYYY-MM.');

    const reservations = await reservationRepository.sumActiveHoursInMonth(memberId, year, month);

    let horas = 0;
    let monto = 0;
    for (const r of reservations) {
      const h = hoursBetween(new Date(r.startsAt), new Date(r.endsAt));
      horas += h;
      monto += h * Number(r.hourlyRateSnapshot);
    }

    return {
      memberId,
      month: monthStr,
      horas: Number(horas.toFixed(2)),
      monto: Number(monto.toFixed(2)),
    };
  }

  filtered(filters) {
    return reservationRepository.findFiltered(filters);
  }
}

module.exports = new ReportService();
