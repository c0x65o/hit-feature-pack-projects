// src/server/api/projects-activity-id.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  projectActivity,
  projects,
  projectActivityTypes,
} from '@/lib/feature-pack-schemas';
import { eq, and } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Extract IDs from URL path
 * Format: /api/projects/{projectId}/activity/{activityId}
 */
function extractIds(request: NextRequest): { projectId: string | null; activityId: string | null } {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const projectIndex = parts.indexOf('projects');
  const activityIndex = parts.indexOf('activity');
  return {
    projectId: projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null,
    activityId: activityIndex >= 0 && parts[activityIndex + 1] ? parts[activityIndex + 1] : null,
  };
}

/**
 * GET /api/projects/[projectId]/activity/[activityId]
 * Get a specific project activity
 */
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, activityId } = extractIds(request);
    if (!projectId || !activityId) {
      return NextResponse.json({ error: 'Missing project id or activity id' }, { status: 400 });
    }

    const db = getDb();
    const perm = await requireProjectPermission(db, projectId, user, 'project.read');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    const [activity] = await db
      .select({
        id: projectActivity.id,
        projectId: projectActivity.projectId,
        typeId: projectActivity.typeId,
        activityType: projectActivity.activityType,
        title: projectActivity.title,
        userId: projectActivity.userId,
        description: projectActivity.description,
        link: projectActivity.link,
        occurredAt: projectActivity.occurredAt,
        metadata: projectActivity.metadata,
        createdAt: projectActivity.createdAt,
        activityTypeRecord: {
          id: projectActivityTypes.id,
          key: projectActivityTypes.key,
          name: projectActivityTypes.name,
          category: projectActivityTypes.category,
          color: projectActivityTypes.color,
          icon: projectActivityTypes.icon,
        },
      })
      .from(projectActivity)
      .leftJoin(projectActivityTypes, eq(projectActivity.typeId, projectActivityTypes.id))
      .where(
        and(
          eq(projectActivity.projectId, projectId),
          eq(projectActivity.id, activityId)
        )
      )
      .limit(1);

    if (!activity) {
      return NextResponse.json({ error: 'Project activity not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        ...activity,
        activityTypeRecord: activity.activityTypeRecord?.id ? activity.activityTypeRecord : null,
      },
    });
  } catch (error) {
    console.error('[projects] Get activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project activity' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[projectId]/activity/[activityId]
 * Update a project activity
 */
export async function PUT(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, activityId } = extractIds(request);
    if (!projectId || !activityId) {
      return NextResponse.json({ error: 'Missing project id or activity id' }, { status: 400 });
    }

    const body = await request.json();
    const db = getDb();

    const perm = await requireProjectPermission(db, projectId, user, 'project.update');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Get existing activity
    const [existing] = await db
      .select()
      .from(projectActivity)
      .where(
        and(
          eq(projectActivity.projectId, projectId),
          eq(projectActivity.id, activityId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Project activity not found' }, { status: 404 });
    }

    // Only allow editing user-created activities (those with typeId)
    // System activities (those with activityType) should not be editable
    if (!existing.typeId) {
      return NextResponse.json(
        { error: 'System activities cannot be edited' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {};

    if (body.typeId !== undefined) {
      if (typeof body.typeId !== 'string') {
        return NextResponse.json({ error: 'Activity type ID must be a string' }, { status: 400 });
      }
      // Verify activity type exists and is active
      const [activityType] = await db
        .select()
        .from(projectActivityTypes)
        .where(and(
          eq(projectActivityTypes.id, body.typeId),
          eq(projectActivityTypes.isActive, true)
        ))
        .limit(1);

      if (!activityType) {
        return NextResponse.json({ error: 'Activity type not found or inactive' }, { status: 404 });
      }
      updates.typeId = body.typeId;
    }

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json({ error: 'Title is required and cannot be empty' }, { status: 400 });
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description || null;
    }

    if (body.link !== undefined) {
      updates.link = body.link || null;
    }

    if (body.occurredAt !== undefined) {
      const d = new Date(body.occurredAt);
      if (!Number.isFinite(d.getTime())) {
        return NextResponse.json({ error: 'Invalid occurredAt date' }, { status: 400 });
      }
      updates.occurredAt = d;
    }

    // Update activity
    const [activity] = await db
      .update(projectActivity)
      .set(updates)
      .where(
        and(
          eq(projectActivity.projectId, projectId),
          eq(projectActivity.id, activityId)
        )
      )
      .returning();

    return NextResponse.json({ data: activity });
  } catch (error) {
    console.error('[projects] Update activity error:', error);
    return NextResponse.json(
      { error: 'Failed to update project activity' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/activity/[activityId]
 * Delete a project activity
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, activityId } = extractIds(request);
    if (!projectId || !activityId) {
      return NextResponse.json({ error: 'Missing project id or activity id' }, { status: 400 });
    }

    const db = getDb();

    const perm = await requireProjectPermission(db, projectId, user, 'project.update');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Get existing activity
    const [existing] = await db
      .select()
      .from(projectActivity)
      .where(
        and(
          eq(projectActivity.projectId, projectId),
          eq(projectActivity.id, activityId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Project activity not found' }, { status: 404 });
    }

    // Only allow deleting user-created activities (those with typeId)
    // System activities (those with activityType) should not be deletable
    if (!existing.typeId) {
      return NextResponse.json(
        { error: 'System activities cannot be deleted' },
        { status: 400 }
      );
    }

    // Delete activity
    await db
      .delete(projectActivity)
      .where(
        and(
          eq(projectActivity.projectId, projectId),
          eq(projectActivity.id, activityId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[projects] Delete activity error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project activity' },
      { status: 500 }
    );
  }
}
