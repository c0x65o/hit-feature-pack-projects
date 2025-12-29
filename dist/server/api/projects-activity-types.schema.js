import { z } from "zod";
// Schema-only module for:
// - POST /api/projects/activity-types
const keyRegex = /^[a-z0-9_]+$/;
export const postBodySchema = z.object({
    key: z.string().min(1).regex(keyRegex),
    name: z.string().min(1),
    category: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    color: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
});
