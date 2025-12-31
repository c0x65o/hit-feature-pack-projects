import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    label: z.ZodString;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip">;
//# sourceMappingURL=projects-statuses.schema.d.ts.map