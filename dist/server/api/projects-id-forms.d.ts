import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/projects/[id]/forms
 * Get all forms that have project reference fields, with entry counts for this project
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: {
        formId: string;
        formName: string;
        formSlug: string;
        projectFieldKey: string;
        count: number;
    }[];
}>>;
//# sourceMappingURL=projects-id-forms.d.ts.map