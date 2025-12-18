// src/server/api/projects-milestones.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectMilestones, projects, projectActivity, MILESTONE_STATUSES, } from '@/lib/feature-pack-schemas';
import { eq, desc } from 'drizzle-orm';
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
 * Log activity to project_activity table
 */
async function logActivity(db, projectId, activityType, userId, description, metadata) {
    await db.insert(projectActivity).values({
        projectId,
        activityType,
        userId,
        description,
        metadata: metadata || null,
    });
}
/**
 * GET /api/projects/[projectId]/milestones
 * List all milestones for a project
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
        const perm = await requireProjectPermission(db, projectId, user, 'project.read');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        // Verify project exists
        const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        // Get all milestones
        const milestones = await db
            .select()
            .from(projectMilestones)
            .where(eq(projectMilestones.projectId, projectId))
            .orderBy(desc(projectMilestones.createdOnTimestamp));
        return NextResponse.json({ data: milestones });
    }
    catch (error) {
        console.error('[projects] List milestones error:', error);
        return NextResponse.json({ error: 'Failed to fetch project milestones' }, { status: 500 });
    }
}
/**
 * POST /api/projects/[projectId]/milestones
 * Create a new milestone
 */
export async function POST(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const projectId = extractProjectId(request);
        if (!projectId) {
            return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
        }
        const body = await request.json();
        const db = getDb();
        const perm = await requireProjectPermission(db, projectId, user, 'milestones.manage');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        // Validate required fields
        if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
            return NextResponse.json({ error: 'Milestone name is required' }, { status: 400 });
        }
        // Validate status
        const status = body.status || 'planned';
        if (!MILESTONE_STATUSES.includes(status)) {
            return NextResponse.json({ error: `Invalid status. Must be one of: ${MILESTONE_STATUSES.join(', ')}` }, { status: 400 });
        }
        // Verify project exists
        const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        // Create milestone
        const [milestone] = await db
            .insert(projectMilestones)
            .values({
            projectId,
            name: body.name.trim(),
            description: body.description || null,
            targetDate: body.targetDate ? new Date(body.targetDate) : null,
            completedDate: body.completedDate ? new Date(body.completedDate) : null,
            status: status,
            createdByUserId: user.sub,
            lastUpdatedByUserId: user.sub,
        })
            .returning();
        // Log activity
        await logActivity(db, projectId, 'project.milestone_created', user.sub, `Milestone "${milestone.name}" was created for project "${project.name}"`, { projectId, milestoneId: milestone.id, milestoneName: milestone.name });
        return NextResponse.json({ data: milestone }, { status: 201 });
    }
    catch (error) {
        console.error('[projects] Create milestone error:', error);
        return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
    }
}
