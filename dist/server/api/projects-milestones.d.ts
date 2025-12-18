import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/projects/[projectId]/milestones
 * List all milestones for a project
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * POST /api/projects/[projectId]/milestones
 * Create a new milestone
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
//# sourceMappingURL=projects-milestones.d.ts.map