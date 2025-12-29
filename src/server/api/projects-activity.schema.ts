import { z } from "zod";

// Schema-only module for:
// - POST /api/projects/[projectId]/activity

const uuid = z.string().uuid();

export const postBodySchema = z.object({
  typeId: uuid,
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  // Server does new Date(occurredAt) if provided; accept ISO strings.
  occurredAt: z.string().optional(),
});

