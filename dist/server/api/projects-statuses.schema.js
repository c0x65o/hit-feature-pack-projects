import { createInsertSchema } from "drizzle-zod";
import { projectStatuses } from "../../schema/projects";
import { z } from "zod";
// Schema-only module for:
// - POST /api/projects/statuses
// Derive schema from Drizzle table, then omit server-controlled fields
const baseSchema = createInsertSchema(projectStatuses, {
    id: z.string().uuid().optional(), // Allow omitting (will be generated)
    createdAt: z.any().optional(), // Server-controlled
    updatedAt: z.any().optional(), // Server-controlled
});
export const postBodySchema = baseSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
