import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    key: z.ZodString;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
//# sourceMappingURL=projects-activity-types.schema.d.ts.map