import { z } from "zod";
export declare const putBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    icon: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    isSystem: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | null | undefined;
    color?: string | null | undefined;
    sortOrder?: number | undefined;
    isActive?: boolean | undefined;
    category?: string | null | undefined;
    icon?: string | null | undefined;
    isSystem?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | null | undefined;
    color?: string | null | undefined;
    sortOrder?: number | undefined;
    isActive?: boolean | undefined;
    category?: string | null | undefined;
    icon?: string | null | undefined;
    isSystem?: boolean | undefined;
}>;
//# sourceMappingURL=projects-activity-types-id.schema.d.ts.map