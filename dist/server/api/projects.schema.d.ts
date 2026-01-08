import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    statusId: z.ZodString;
    companyId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip">;
//# sourceMappingURL=projects.schema.d.ts.map