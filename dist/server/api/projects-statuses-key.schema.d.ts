import { z } from "zod";
export declare const putBodySchema: z.ZodObject<{
    label: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
//# sourceMappingURL=projects-statuses-key.schema.d.ts.map