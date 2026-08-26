const { z } = require('zod');

const createReservationSchema = z.object({
  spaceId: z.number().int().positive(),
  startsAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  endsAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
});

module.exports = { createReservationSchema };
