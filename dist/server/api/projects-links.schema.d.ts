import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    entityId: z.ZodString;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-zod").Json, unknown, z.core.$ZodTypeInternals<import("drizzle-zod").Json, unknown>>>>;
    entityType: z.ZodString;
}, "strip">;
//# sourceMappingURL=projects-links.schema.d.ts.map