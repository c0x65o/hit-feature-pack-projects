import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    label: z.ZodString;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    label: string;
    color?: string | null | undefined;
    sortOrder?: number | undefined;
    isActive?: boolean | undefined;
}, {
    label: string;
    color?: string | null | undefined;
    sortOrder?: number | undefined;
    isActive?: boolean | undefined;
}>;
//# sourceMappingURL=projects-statuses.schema.d.ts.map