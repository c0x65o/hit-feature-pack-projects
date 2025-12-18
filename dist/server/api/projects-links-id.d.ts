import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/projects/[projectId]/links/[linkId]
 * Get a specific project link
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * PUT /api/projects/[projectId]/links/[linkId]
 * Update a project link (metadata only)
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * DELETE /api/projects/[projectId]/links/[linkId]
 * Remove a link from a project
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
}>>;
//# sourceMappingURL=projects-links-id.d.ts.map