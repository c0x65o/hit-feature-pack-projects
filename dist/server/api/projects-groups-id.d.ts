import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/projects/[projectId]/groups/[groupId]
 */
export declare function GET(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * PUT /api/projects/[projectId]/groups/[groupId]
 * Update a group role
 */
export declare function PUT(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
/**
 * DELETE /api/projects/[projectId]/groups/[groupId]
 * Remove a group role
 */
export declare function DELETE(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    ok: boolean;
}>>;
//# sourceMappingURL=projects-groups-id.d.ts.map