import { z } from "zod";
// Schema-only module for:
// - POST /api/projects/statuses
export const postBodySchema = z.object({
    label: z.string().min(1).max(50),
    color: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
});
