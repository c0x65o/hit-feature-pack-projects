import { z } from "zod";

// Schema-only module for:
// - POST /api/projects

const uuid = z.string().uuid();

export const postBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().optional(),
  statusId: uuid.optional(),
  // Company association is feature-flagged server-side; keep optional here.
  companyId: uuid.optional(),
});

