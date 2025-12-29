import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    typeId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    link: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    occurredAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    typeId: string;
    title: string;
    description?: string | null | undefined;
    link?: string | null | undefined;
    occurredAt?: string | undefined;
}, {
    typeId: string;
    title: string;
    description?: string | null | undefined;
    link?: string | null | undefined;
    occurredAt?: string | undefined;
}>;
//# sourceMappingURL=projects-activity.schema.d.ts.map