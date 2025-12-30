import { z } from "zod";
export declare const postBodySchema: z.ZodObject<Omit<{
    id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    name: z.ZodString;
    slug: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    statusId: z.ZodString;
    companyId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdByUserId: z.ZodOptional<z.ZodString>;
    createdOnTimestamp: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
    lastUpdatedByUserId: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    lastUpdatedOnTimestamp: z.ZodOptional<z.ZodOptional<z.ZodAny>>;
}, "id" | "createdByUserId" | "createdOnTimestamp" | "lastUpdatedByUserId" | "lastUpdatedOnTimestamp">, z.UnknownKeysParam, z.ZodTypeAny, {
    name: string;
    statusId: string;
    slug?: string | null | undefined;
    description?: string | null | undefined;
    companyId?: string | null | undefined;
}, {
    name: string;
    statusId: string;
    slug?: string | null | undefined;
    description?: string | null | undefined;
    companyId?: string | null | undefined;
}>;
//# sourceMappingURL=projects.schema.d.ts.map