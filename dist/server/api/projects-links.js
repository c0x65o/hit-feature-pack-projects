// src/server/api/projects-links.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectLinks, projects, projectActivity, } from '@/lib/feature-pack-schemas';
import { eq, desc, and } from 'drizzle-orm';
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
 * GET /api/projects/[projectId]/links
 * List all links for a project
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
        // Optional filtering by entity type
        const entityType = searchParams.get('entityType');
        // Verify project exists
        const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);
        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        // Build query
        const conditions = [eq(projectLinks.projectId, projectId)];
        if (entityType) {
            conditions.push(eq(projectLinks.entityType, entityType));
        }
        const links = await db
            .select()
            .from(projectLinks)
            .where(and(...conditions))
            .orderBy(desc(projectLinks.createdOnTimestamp));
        return NextResponse.json({ data: links });
    }
    catch (error) {
        console.error('[projects] List links error:', error);
        return NextResponse.json({ error: 'Failed to fetch project links' }, { status: 500 });
    }
}
/**
 * POST /api/projects/[projectId]/links
 * Create a new link
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
        const perm = await requireProjectPermission(db, projectId, user, 'links.manage');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        // Validate required fields
        if (!body.entityType || typeof body.entityType !== 'string') {
            return NextResponse.json({ error: 'Entity type is required' }, { status: 400 });
        }
        if (!body.entityId || typeof body.entityId !== 'string') {
            return NextResponse.json({ error: 'Entity ID is required' }, { status: 400 });
        }
        // Validate entity_type format (should match dotted namespace pattern)
        const entityTypePattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
        if (!entityTypePattern.test(body.entityType)) {
            return NextResponse.json({ error: 'Entity type must follow dotted namespace format (e.g., "crm.account", "marketing.plan")' }, { status: 400 });
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
        // Check if link already exists
        const existing = await db
            .select()
            .from(projectLinks)
            .where(and(eq(projectLinks.projectId, projectId), eq(projectLinks.entityType, body.entityType), eq(projectLinks.entityId, body.entityId)))
            .limit(1);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Link already exists' }, { status: 409 });
        }
        // Create link
        const [link] = await db
            .insert(projectLinks)
            .values({
            projectId,
            entityType: body.entityType,
            entityId: body.entityId,
            metadata: body.metadata || null,
            createdByUserId: user.sub,
            lastUpdatedByUserId: user.sub,
        })
            .returning();
        // Log activity
        await logActivity(db, projectId, 'project.link_added', user.sub, `Link to ${body.entityType}:${body.entityId} was added to project "${project.name}"`, { projectId, entityType: body.entityType, entityId: body.entityId });
        return NextResponse.json({ data: link }, { status: 201 });
    }
    catch (error) {
        console.error('[projects] Create link error:', error);
        return NextResponse.json({ error: 'Failed to create project link' }, { status: 500 });
    }
}
