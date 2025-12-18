import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/projects/[id]
 * Get a specific project
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * PUT /api/projects/[id]
 * Update a project
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * DELETE /api/projects/[id]
 * Delete a project (soft delete by setting status to 'archived')
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
//# sourceMappingURL=projects-id.d.ts.map