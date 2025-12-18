import { NextRequest, NextResponse } from 'next/server';
export declare const dynamic = "force-dynamic";
export declare const runtime = "nodejs";
/**
 * GET /api/projects/statuses
 * List status catalog (public; used by Projects UI)
 */
export declare function GET(): Promise<NextResponse<{
    data: any;
}> | NextResponse<{
    error: string;
}>>;
/**
 * POST /api/projects/statuses
 * Create a new status (admin only)
 */
export declare function POST(request: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    data: any;
}>>;
//# sourceMappingURL=projects-statuses.d.ts.map