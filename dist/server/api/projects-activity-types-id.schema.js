import { z } from "zod";
// Schema-only module for:
// - PUT /api/projects/activity-types/[id]
export const putBodySchema = z.object({
    name: z.string().min(1).optional(),
    category: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    // Used by server-side guardrails for system types.
    isSystem: z.boolean().optional(),
});
