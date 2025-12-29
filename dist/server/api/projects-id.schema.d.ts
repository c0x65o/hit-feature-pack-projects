import { z } from "zod";
export declare const putBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    slug: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    statusId: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">, z.ZodNull]>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    slug?: string | null | undefined;
    description?: string | null | undefined;
    statusId?: string | undefined;
    companyId?: string | null | undefined;
}, {
    name?: string | undefined;
    slug?: string | null | undefined;
    description?: string | null | undefined;
    statusId?: string | undefined;
    companyId?: string | null | undefined;
}>;
//# sourceMappingURL=projects-id.schema.d.ts.map