const { z } = require('zod');

const planSchema = z.object({
  name: z.string().min(2).max(80),
  price: z.number().nonnegative(),
  includedHours: z.number().int().positive(),
  allowedSpaceTypes: z.array(z.enum(['desk', 'meeting_room', 'event_room'])).min(1),
});

const planUpdateSchema = planSchema.partial();

module.exports = { planSchema, planUpdateSchema };
