// src/server/api/projects-links-id.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  projectLinks,
  projects,
  projectActivity,
  SYSTEM_ACTIVITY_TYPES,
} from '@/lib/feature-pack-schemas';
import { eq, and } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Extract IDs from URL path
 * Format: /api/projects/{projectId}/links/{linkId}
 */
function extractIds(request: NextRequest): { projectId: string | null; linkId: string | null } {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const projectIndex = parts.indexOf('projects');
  const linkIndex = parts.indexOf('links');
  return {
    projectId: projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null,
    linkId: linkIndex >= 0 && parts[linkIndex + 1] ? parts[linkIndex + 1] : null,
  };
}

/**
 * Log activity to project_activity table
 */
async function logActivity(
  db: ReturnType<typeof getDb>,
  projectId: string,
  activityType: (typeof SYSTEM_ACTIVITY_TYPES)[number],
  userId: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  await db.insert(projectActivity).values({
    projectId,
    activityType,
    userId,
    description,
    metadata: metadata || null,
  });
}

/**
 * GET /api/projects/[projectId]/links/[linkId]
 * Get a specific project link
 */
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, linkId } = extractIds(request);
    if (!projectId || !linkId) {
      return NextResponse.json({ error: 'Missing project id or link id' }, { status: 400 });
    }

    const db = getDb();
    const perm = await requireProjectPermission(db, projectId, user, 'project.read');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }
    const [link] = await db
      .select()
      .from(projectLinks)
      .where(
        and(
          eq(projectLinks.projectId, projectId),
          eq(projectLinks.id, linkId)
        )
      )
      .limit(1);

    if (!link) {
      return NextResponse.json({ error: 'Project link not found' }, { status: 404 });
    }

    return NextResponse.json({ data: link });
  } catch (error) {
    console.error('[projects] Get link error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project link' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[projectId]/links/[linkId]
 * Update a project link (metadata only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, linkId } = extractIds(request);
    if (!projectId || !linkId) {
      return NextResponse.json({ error: 'Missing project id or link id' }, { status: 400 });
    }

    const body = await request.json();
    const db = getDb();

    const perm = await requireProjectPermission(db, projectId, user, 'links.manage');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Get existing link
    const [existing] = await db
      .select()
      .from(projectLinks)
      .where(
        and(
          eq(projectLinks.projectId, projectId),
          eq(projectLinks.id, linkId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Project link not found' }, { status: 404 });
    }

    // Get project for activity log
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    // Build update object (only metadata can be updated)
    const updates: Record<string, unknown> = {
      lastUpdatedByUserId: user.sub,
      lastUpdatedOnTimestamp: new Date(),
    };

    if (body.metadata !== undefined) {
      updates.metadata = body.metadata || null;
    }

    // Update link
    const [link] = await db
      .update(projectLinks)
      .set(updates)
      .where(
        and(
          eq(projectLinks.projectId, projectId),
          eq(projectLinks.id, linkId)
        )
      )
      .returning();

    // Log activity
    await logActivity(
      db,
      projectId,
      'project.link_updated',
      user.sub,
      `Link to ${link.entityType}:${link.entityId} was updated in project "${project?.name || projectId}"`,
      { projectId, entityType: link.entityType, entityId: link.entityId }
    );

    return NextResponse.json({ data: link });
  } catch (error) {
    console.error('[projects] Update link error:', error);
    return NextResponse.json(
      { error: 'Failed to update project link' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/links/[linkId]
 * Remove a link from a project
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, linkId } = extractIds(request);
    if (!projectId || !linkId) {
      return NextResponse.json({ error: 'Missing project id or link id' }, { status: 400 });
    }

    const db = getDb();

    const perm = await requireProjectPermission(db, projectId, user, 'links.manage');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Get existing link
    const [existing] = await db
      .select()
      .from(projectLinks)
      .where(
        and(
          eq(projectLinks.projectId, projectId),
          eq(projectLinks.id, linkId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Project link not found' }, { status: 404 });
    }

    // Get project for activity log
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    // Remove link
    await db
      .delete(projectLinks)
      .where(
        and(
          eq(projectLinks.projectId, projectId),
          eq(projectLinks.id, linkId)
        )
      );

    // Log activity
    await logActivity(
      db,
      projectId,
      'project.link_removed',
      user.sub,
      `Link to ${existing.entityType}:${existing.entityId} was removed from project "${project?.name || projectId}"`,
      { projectId, entityType: existing.entityType, entityId: existing.entityId }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[projects] Remove link error:', error);
    return NextResponse.json(
      { error: 'Failed to remove project link' },
      { status: 500 }
    );
  }
}

