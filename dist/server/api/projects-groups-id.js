// src/server/api/projects-groups-id.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectGroupRoles, projects, projectActivity, PROJECT_ROLES, } from '@/lib/feature-pack-schemas';
import { eq, and, sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * Extract IDs from URL path
 * Format: /api/projects/{projectId}/groups/{groupId}
 */
function extractIds(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const projectIndex = parts.indexOf('projects');
    const groupsIndex = parts.indexOf('groups');
    const projectId = projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null;
    const groupId = groupsIndex >= 0 && parts[groupsIndex + 1] ? decodeURIComponent(parts[groupsIndex + 1]) : null;
    return { projectId, groupId };
}
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
 * GET /api/projects/[projectId]/groups/[groupId]
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { projectId, groupId } = extractIds(request);
        if (!projectId || !groupId) {
            return NextResponse.json({ error: 'Missing project id or group id' }, { status: 400 });
        }
        const db = getDb();
        const perm = await requireProjectPermission(db, projectId, user, 'project.read');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        const [row] = await db
            .select()
            .from(projectGroupRoles)
            .where(and(eq(projectGroupRoles.projectId, projectId), eq(projectGroupRoles.groupId, groupId)))
            .limit(1);
        if (!row) {
            return NextResponse.json({ error: 'Project group not found' }, { status: 404 });
        }
        return NextResponse.json({ data: row });
    }
    catch (error) {
        console.error('[projects] Get group error:', error);
        return NextResponse.json({ error: 'Failed to fetch project group' }, { status: 500 });
    }
}
/**
 * PUT /api/projects/[projectId]/groups/[groupId]
 * Update a group role
 */
export async function PUT(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { projectId, groupId } = extractIds(request);
        if (!projectId || !groupId) {
            return NextResponse.json({ error: 'Missing project id or group id' }, { status: 400 });
        }
        const body = await request.json();
        const db = getDb();
        const perm = await requireProjectPermission(db, projectId, user, 'groups.manage');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        const [existing] = await db
            .select()
            .from(projectGroupRoles)
            .where(and(eq(projectGroupRoles.projectId, projectId), eq(projectGroupRoles.groupId, groupId)))
            .limit(1);
        if (!existing) {
            return NextResponse.json({ error: 'Project group not found' }, { status: 404 });
        }
        const nextRole = body.role ?? existing.role;
        if (!PROJECT_ROLES.includes(nextRole)) {
            return NextResponse.json({ error: `Invalid role. Must be one of: ${PROJECT_ROLES.join(', ')}` }, { status: 400 });
        }
        // Prevent removing/changing the last owner group
        if (existing.role === 'owner' && nextRole !== 'owner') {
            const [row] = await db
                .select({ count: sql `count(*)` })
                .from(projectGroupRoles)
                .where(and(eq(projectGroupRoles.projectId, projectId), eq(projectGroupRoles.role, 'owner')));
            const owners = Number(row?.count ?? 0);
            if (owners <= 1) {
                return NextResponse.json({ error: 'Cannot remove the last owner group' }, { status: 400 });
            }
        }
        const [updated] = await db
            .update(projectGroupRoles)
            .set({
            role: nextRole,
            lastUpdatedByUserId: user.sub,
            lastUpdatedOnTimestamp: new Date(),
        })
            .where(and(eq(projectGroupRoles.projectId, projectId), eq(projectGroupRoles.groupId, groupId)))
            .returning();
        if (existing.role !== updated.role) {
            const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
            await logActivity(db, projectId, 'project.group_role_changed', user.sub, `Group ${groupId} role changed from "${existing.role}" to "${updated.role}" in project "${project?.name || projectId}"`, { projectId, groupId, fromRole: existing.role, toRole: updated.role });
        }
        return NextResponse.json({ data: updated });
    }
    catch (error) {
        console.error('[projects] Update group error:', error);
        return NextResponse.json({ error: 'Failed to update project group' }, { status: 500 });
    }
}
/**
 * DELETE /api/projects/[projectId]/groups/[groupId]
 * Remove a group role
 */
export async function DELETE(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { projectId, groupId } = extractIds(request);
        if (!projectId || !groupId) {
            return NextResponse.json({ error: 'Missing project id or group id' }, { status: 400 });
        }
        const db = getDb();
        const perm = await requireProjectPermission(db, projectId, user, 'groups.manage');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        const [existing] = await db
            .select()
            .from(projectGroupRoles)
            .where(and(eq(projectGroupRoles.projectId, projectId), eq(projectGroupRoles.groupId, groupId)))
            .limit(1);
        if (!existing) {
            return NextResponse.json({ error: 'Project group not found' }, { status: 404 });
        }
        if (existing.role === 'owner') {
            const [row] = await db
                .select({ count: sql `count(*)` })
                .from(projectGroupRoles)
                .where(and(eq(projectGroupRoles.projectId, projectId), eq(projectGroupRoles.role, 'owner')));
            const owners = Number(row?.count ?? 0);
            if (owners <= 1) {
                return NextResponse.json({ error: 'Cannot remove the last owner group' }, { status: 400 });
            }
        }
        await db
            .delete(projectGroupRoles)
            .where(and(eq(projectGroupRoles.projectId, projectId), eq(projectGroupRoles.groupId, groupId)));
        const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        await logActivity(db, projectId, 'project.group_removed', user.sub, `Group ${groupId} was removed from project "${project?.name || projectId}"`, { projectId, groupId });
        return NextResponse.json({ ok: true });
    }
    catch (error) {
        console.error('[projects] Remove group error:', error);
        return NextResponse.json({ error: 'Failed to remove project group' }, { status: 500 });
    }
}
