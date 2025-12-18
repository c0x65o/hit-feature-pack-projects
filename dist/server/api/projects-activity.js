// src/server/api/projects-activity.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectActivity, projects } from '@/lib/feature-pack-schemas';
import { eq, desc, and, sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * Extract project ID from URL path
 */
function extractProjectId(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const projectIndex = parts.indexOf('projects');
    return projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null;
}
/**
 * GET /api/projects/[projectId]/activity
 * List activity log for a project (read-only)
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const projectId = extractProjectId(request);
        if (!projectId) {
            return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
        }
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const perm = await requireProjectPermission(db, projectId, user, 'project.read');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        // Pagination
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
        const offset = (page - 1) * pageSize;
        // Optional filtering
        const activityType = searchParams.get('activityType');
        // Verify project exists
        const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        // Build query conditions
        const conditions = [eq(projectActivity.projectId, projectId)];
        if (activityType) {
            conditions.push(eq(projectActivity.activityType, activityType));
        }
        const whereClause = and(...conditions);
        // Get activities
        const activities = await db
            .select()
            .from(projectActivity)
            .where(whereClause)
            .orderBy(desc(projectActivity.createdAt))
            .limit(pageSize)
            .offset(offset);
        // Get total count
        const countResult = await db
            .select({ count: sql `count(*)` })
            .from(projectActivity)
            .where(whereClause);
        const total = Number(countResult[0]?.count || 0);
        return NextResponse.json({
            data: activities,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error('[projects] List activity error:', error);
        return NextResponse.json({ error: 'Failed to fetch project activity' }, { status: 500 });
    }
}
