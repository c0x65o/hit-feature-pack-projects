import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/projects/[projectId]/milestones/[milestoneId]
 * Get a specific milestone
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * PUT /api/projects/[projectId]/milestones/[milestoneId]
 * Update a milestone
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * DELETE /api/projects/[projectId]/milestones/[milestoneId]
 * Delete a milestone
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
//# sourceMappingURL=projects-milestones-id.d.ts.map