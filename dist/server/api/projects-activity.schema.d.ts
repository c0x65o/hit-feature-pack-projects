import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    typeId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    link: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    occurredAt: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=projects-activity.schema.d.ts.map