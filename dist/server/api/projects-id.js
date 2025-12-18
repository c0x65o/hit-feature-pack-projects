// src/server/api/projects-id.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projects, projectStatuses, projectActivity } from '@/lib/feature-pack-schemas';
import { eq } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * Extract project ID from URL path
 */
function extractId(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    // /api/projects/{projectId} -> projectId is at index 3 (0=empty, 1=api, 2=projects, 3=projectId)
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
async function isValidProjectStatus(db, key) {
    const [row] = await db
        .select({ key: projectStatuses.key, isActive: projectStatuses.isActive })
        .from(projectStatuses)
        .where(eq(projectStatuses.key, key))
        .limit(1);
    return Boolean(row && row.isActive);
}
/**
 * GET /api/projects/[id]
 * Get a specific project
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
        }
        const db = getDb();
        const perm = await requireProjectPermission(db, id, user, 'project.read');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, id))
            .limit(1);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        return NextResponse.json({ data: project });
    }
    catch (error) {
        console.error('[projects] Get project error:', error);
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }
}
/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
        }
        const body = await request.json();
        const db = getDb();
        const perm = await requireProjectPermission(db, id, user, 'project.update');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        // Get existing project
        const [existing] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, id))
            .limit(1);
        if (!existing) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        // Build update object
        const updates = {
            lastUpdatedByUserId: user.sub,
            lastUpdatedOnTimestamp: new Date(),
        };
        if (body.name !== undefined) {
            if (typeof body.name !== 'string' || body.name.trim().length === 0) {
                return NextResponse.json({ error: 'Project name cannot be empty' }, { status: 400 });
            }
            updates.name = body.name.trim();
        }
        if (body.description !== undefined) {
            updates.description = body.description || null;
        }
        if (body.status !== undefined) {
            const statusKey = String(body.status).trim();
            if (!statusKey) {
                return NextResponse.json({ error: 'Status cannot be empty' }, { status: 400 });
            }
            const ok = await isValidProjectStatus(db, statusKey);
            if (!ok) {
                return NextResponse.json({ error: `Invalid status: ${statusKey}` }, { status: 400 });
            }
            updates.status = statusKey;
        }
        if (body.slug !== undefined) {
            updates.slug = body.slug || null;
        }
        // Update project
        const [project] = await db
            .update(projects)
            .set(updates)
            .where(eq(projects.id, id))
            .returning();
        // Log activity
        const activityMetadata = { projectId: project.id };
        if (body.status && body.status !== existing.status) {
            await logActivity(db, project.id, 'project.status_changed', user.sub, `Project status changed from "${existing.status}" to "${project.status}"`, { ...activityMetadata, oldStatus: existing.status, newStatus: project.status });
        }
        else {
            await logActivity(db, project.id, 'project.updated', user.sub, `Project "${project.name}" was updated`, activityMetadata);
        }
        return NextResponse.json({ data: project });
    }
    catch (error) {
        console.error('[projects] Update project error:', error);
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
    }
}
/**
 * DELETE /api/projects/[id]
 * Permanently delete a project and all related data (cascade deletes handled by DB)
 */
export async function DELETE(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const id = extractId(request);
        if (!id) {
            return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
        }
        const db = getDb();
        const perm = await requireProjectPermission(db, id, user, 'project.archive');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        // Get existing project before deletion
        const [existing] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, id))
            .limit(1);
        if (!existing) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        // Hard delete - cascade will handle related records (milestones, links, activity, notes)
        await db
            .delete(projects)
            .where(eq(projects.id, id));
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('[projects] Delete project error:', error);
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
    }
}
