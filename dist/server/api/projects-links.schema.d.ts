import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    entityId: z.ZodString;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodType<import("drizzle-zod").Json, z.ZodTypeDef, import("drizzle-zod").Json>>>;
} & {
    entityType: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entityType: string;
    entityId: string;
    metadata?: import("drizzle-zod").Json | undefined;
}, {
    entityType: string;
    entityId: string;
    metadata?: import("drizzle-zod").Json | undefined;
}>;
//# sourceMappingURL=projects-links.schema.d.ts.map