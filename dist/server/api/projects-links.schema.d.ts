import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    entityType: z.ZodString;
    entityId: z.ZodString;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    entityType: string;
    entityId: string;
    metadata?: Record<string, any> | null | undefined;
}, {
    entityType: string;
    entityId: string;
    metadata?: Record<string, any> | null | undefined;
}>;
//# sourceMappingURL=projects-links.schema.d.ts.map