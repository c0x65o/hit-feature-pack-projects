import { z } from "zod";

// Schema-only module for:
// - PUT /api/projects/[projectId]

const uuid = z.string().uuid();

export const putBodySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  statusId: uuid.optional(),
  // Server supports clearing companyId via null or empty string (when enabled).
  companyId: z.union([uuid, z.literal(""), z.null()]).optional(),
});

