import { z } from "zod";

// Schema-only module for:
// - POST /api/projects/[projectId]/links

const entityTypePattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export const postBodySchema = z.object({
  entityType: z.string().regex(entityTypePattern),
  entityId: z.string().min(1),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

