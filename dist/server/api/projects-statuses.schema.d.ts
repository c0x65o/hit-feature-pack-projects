import { z } from "zod";
export declare const postBodySchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    label: z.ZodString;
    color: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    sortOrder: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
    updatedAt: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, "id" | "createdAt" | "updatedAt">, z.UnknownKeysParam, z.ZodTypeAny, {
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