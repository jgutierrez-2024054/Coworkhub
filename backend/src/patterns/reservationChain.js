// patterns/reservationChain.js
//
// PATRON DE DISEÑO: Chain of Responsibility.
//
// Problema real que resuelve: crear una reserva debe pasar por varias reglas de
// negocio independientes (espacio activo, sin solapamiento, dentro del limite de
// horas del plan). Si esa logica se mete toda en un solo metodo gigante, se vuelve
// dificil de leer, probar y extender (ej. manana el cliente pide una regla nueva,
// como "no reservar la sala de eventos con menos de 24h de anticipacion").
//
// Con Chain of Responsibility, cada regla es un eslabon independiente, testeable
// por separado (cumple Single Responsibility Principle), y agregar una regla nueva
// es solo agregar un eslabon mas a la cadena (Open/Closed Principle): no hay que
// tocar los eslabones existentes.
const { DomainError } = require('../middlewares/errorHandler');

class ReservationRule {
  setNext(rule) {
    this.next = rule;
    return rule;
  }

  async check(context) {
    if (this.next) return this.next.check(context);
    return true;
  }
}

class SpaceMustBeActiveRule extends ReservationRule {
  async check(context) {
    if (!context.space.active) {
      throw new DomainError(422, 'El espacio esta inactivo y no puede reservarse.');
    }
    return super.check(context);
  }
}

class NoOverlapRule extends ReservationRule {
  async check(context) {
    if (context.overlapping.length > 0) {
      throw new DomainError(409, 'El espacio ya esta reservado en ese horario.');
    }
    return super.check(context);
  }
}

class PlanHoursLimitRule extends ReservationRule {
  async check(context) {
    const { plan, existingHoursThisMonth, requestedHours, space } = context;
    
    // Si no tiene plan y es escritorio, permitir sin límite de horas
    if (!plan && space.type === 'desk') {
      return super.check(context);
    }
    
    // Si no tiene plan y no es escritorio, error (manejado en PlanSpaceTypeRule)
    if (!plan) {
      return super.check(context);
    }
    
    if (existingHoursThisMonth + requestedHours > plan.includedHours) {
      throw new DomainError(
        422,
        `Esta reserva supera el limite de horas de tu plan (${plan.includedHours}h/mes).`
      );
    }
    return super.check(context);
  }
}

class PlanSpaceTypeRule extends ReservationRule {
  async check(context) {
    const { plan, space } = context;
    
    // Si no tiene plan, solo permitir escritorios
    if (!plan) {
      if (space.type !== 'desk') {
        throw new DomainError(422, 'Para reservar salas de reuniones o eventos necesitas adquirir un plan.');
      }
      return super.check(context);
    }
    
    // Si tiene plan, verificar que el tipo de espacio esté permitido
    if (!plan.allowedSpaceTypes.includes(space.type)) {
      throw new DomainError(422, 'Tu plan no tiene acceso a este tipo de espacio.');
    }
    return super.check(context);
  }
}

function buildReservationChain() {
  const active = new SpaceMustBeActiveRule();
  const overlap = new NoOverlapRule();
  const planType = new PlanSpaceTypeRule();
  const planLimit = new PlanHoursLimitRule();

  active.setNext(overlap).setNext(planType).setNext(planLimit);
  return active;
}

module.exports = { buildReservationChain };
