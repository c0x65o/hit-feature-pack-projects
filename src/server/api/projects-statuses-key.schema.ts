import { z } from "zod";

// Schema-only module for:
// - PUT /api/projects/statuses/[statusKey] (actually status id)

export const putBodySchema = z.object({
  label: z.string().min(1).max(50).optional(),
  color: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

