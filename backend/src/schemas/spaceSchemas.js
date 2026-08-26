const { z } = require('zod');

const spaceSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(['desk', 'meeting_room', 'event_room']),
  capacity: z.number().int().positive(),
  hourlyRate: z.number().nonnegative(),
  imageUrl: z.string().url().nullable().optional(),
  active: z.boolean().optional(),
});

const spaceUpdateSchema = spaceSchema.partial();

module.exports = { spaceSchema, spaceUpdateSchema };
