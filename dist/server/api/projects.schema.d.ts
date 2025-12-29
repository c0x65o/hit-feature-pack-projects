import { z } from "zod";
export declare const postBodySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    statusId: z.ZodOptional<z.ZodString>;
    companyId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug?: string | undefined;
    description?: string | undefined;
    statusId?: string | undefined;
    companyId?: string | undefined;
}, {
    name: string;
    slug?: string | undefined;
    description?: string | undefined;
    statusId?: string | undefined;
    companyId?: string | undefined;
}>;
//# sourceMappingURL=projects.schema.d.ts.map