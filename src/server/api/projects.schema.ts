import { createInsertSchema } from "drizzle-zod";
import { projects } from "../../schema/projects";
import { z } from "zod";

// Schema-only module for:
// - POST /api/projects

// Derive schema from Drizzle table, then omit server-controlled fields
const baseSchema = createInsertSchema(projects, {
  id: z.string().uuid().optional(), // Allow omitting (will be generated)
  createdByUserId: z.string().optional(), // Server-controlled (from auth)
  createdOnTimestamp: z.any().optional(), // Server-controlled
  lastUpdatedByUserId: z.string().optional(), // Server-controlled (from auth)
  lastUpdatedOnTimestamp: z.any().optional(), // Server-controlled
});

export const postBodySchema = baseSchema.omit({
  id: true,
  createdByUserId: true,
  createdOnTimestamp: true,
  lastUpdatedByUserId: true,
  lastUpdatedOnTimestamp: true,
});

