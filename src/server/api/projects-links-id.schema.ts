import { z } from "zod";

// Schema-only module for:
// - PUT /api/projects/[projectId]/links/[linkId]
// (Only metadata is updatable.)

export const putBodySchema = z.object({
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

