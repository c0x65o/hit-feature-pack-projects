import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    key: z.ZodString;
    name: z.ZodString;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    key: string;
    description?: string | null | undefined;
    color?: string | null | undefined;
    category?: string | null | undefined;
    icon?: string | null | undefined;
}, {
    name: string;
    key: string;
    description?: string | null | undefined;
    color?: string | null | undefined;
    category?: string | null | undefined;
    icon?: string | null | undefined;
}>;
//# sourceMappingURL=projects-activity-types.schema.d.ts.map