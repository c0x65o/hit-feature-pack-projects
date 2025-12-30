import { createInsertSchema } from "drizzle-zod";
import { projectLinks } from "../../schema/projects";
import { z } from "zod";

// Schema-only module for:
// - POST /api/projects/[projectId]/links

const entityTypePattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

// Derive schema from Drizzle table, then omit server-controlled fields
// Note: projectId comes from URL path, not body
const baseSchema = createInsertSchema(projectLinks, {
  id: z.string().uuid().optional(), // Allow omitting (will be generated)
  projectId: z.string().uuid().optional(), // Comes from URL path
  createdByUserId: z.string().optional(), // Server-controlled (from auth)
  createdOnTimestamp: z.any().optional(), // Server-controlled
  lastUpdatedByUserId: z.string().optional(), // Server-controlled (from auth)
  lastUpdatedOnTimestamp: z.any().optional(), // Server-controlled
});

export const postBodySchema = baseSchema
  .omit({
    id: true,
    projectId: true, // Set from URL path in handler
    createdByUserId: true,
    createdOnTimestamp: true,
    lastUpdatedByUserId: true,
    lastUpdatedOnTimestamp: true,
  })
  .extend({
    // Enforce entityType pattern
    entityType: z.string().regex(entityTypePattern),
  });

