const { z } = require('zod');

const assignPlanSchema = z.object({
  planId: z.number().int().positive(),
});

module.exports = { assignPlanSchema };
