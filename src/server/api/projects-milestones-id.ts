// src/server/api/projects-milestones-id.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  projectMilestones,
  projects,
  projectActivity,
  ACTIVITY_TYPES,
  MILESTONE_STATUSES,
} from '@/lib/feature-pack-schemas';
import { eq, and } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Extract IDs from URL path
 * Format: /api/projects/{projectId}/milestones/{milestoneId}
 */
function extractIds(request: NextRequest): {
  projectId: string | null;
  milestoneId: string | null;
} {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const projectIndex = parts.indexOf('projects');
  const milestoneIndex = parts.indexOf('milestones');
  return {
    projectId: projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null,
    milestoneId: milestoneIndex >= 0 && parts[milestoneIndex + 1] ? parts[milestoneIndex + 1] : null,
  };
}

/**
 * Log activity to project_activity table
 */
async function logActivity(
  db: ReturnType<typeof getDb>,
  projectId: string,
  activityType: (typeof ACTIVITY_TYPES)[number],
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
 * GET /api/projects/[projectId]/milestones/[milestoneId]
 * Get a specific milestone
 */
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, milestoneId } = extractIds(request);
    if (!projectId || !milestoneId) {
      return NextResponse.json({ error: 'Missing project id or milestone id' }, { status: 400 });
    }

    const db = getDb();
    const perm = await requireProjectPermission(db, projectId, user, 'project.read');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }
    const [milestone] = await db
      .select()
      .from(projectMilestones)
      .where(
        and(
          eq(projectMilestones.projectId, projectId),
          eq(projectMilestones.id, milestoneId)
        )
      )
      .limit(1);

    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    return NextResponse.json({ data: milestone });
  } catch (error) {
    console.error('[projects] Get milestone error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestone' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[projectId]/milestones/[milestoneId]
 * Update a milestone
 */
export async function PUT(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, milestoneId } = extractIds(request);
    if (!projectId || !milestoneId) {
      return NextResponse.json({ error: 'Missing project id or milestone id' }, { status: 400 });
    }

    const body = await request.json();
    const db = getDb();

    const perm = await requireProjectPermission(db, projectId, user, 'milestones.manage');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Get existing milestone
    const [existing] = await db
      .select()
      .from(projectMilestones)
      .where(
        and(
          eq(projectMilestones.projectId, projectId),
          eq(projectMilestones.id, milestoneId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Get project for activity log
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    // Build update object
    const updates: Record<string, unknown> = {
      lastUpdatedByUserId: user.sub,
      lastUpdatedOnTimestamp: new Date(),
    };

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({ error: 'Milestone name cannot be empty' }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description || null;
    }

    if (body.targetDate !== undefined) {
      updates.targetDate = body.targetDate ? new Date(body.targetDate) : null;
    }

    if (body.status !== undefined) {
      if (!MILESTONE_STATUSES.includes(body.status as (typeof MILESTONE_STATUSES)[number])) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${MILESTONE_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updates.status = body.status;

      // Auto-set completedDate when status changes to completed
      if (body.status === 'completed' && !existing.completedDate) {
        updates.completedDate = new Date();
      } else if (body.status !== 'completed' && existing.completedDate) {
        updates.completedDate = null;
      }
    }

    if (body.completedDate !== undefined) {
      updates.completedDate = body.completedDate ? new Date(body.completedDate) : null;
    }

    // Update milestone
    const [milestone] = await db
      .update(projectMilestones)
      .set(updates)
      .where(
        and(
          eq(projectMilestones.projectId, projectId),
          eq(projectMilestones.id, milestoneId)
        )
      )
      .returning();

    // Log activity
    const activityMetadata: Record<string, unknown> = {
      projectId,
      milestoneId: milestone.id,
      milestoneName: milestone.name,
    };

    if (body.status && body.status !== existing.status) {
      if (body.status === 'completed') {
        await logActivity(
          db,
          projectId,
          'project.milestone_completed',
          user.sub,
          `Milestone "${milestone.name}" was completed for project "${project?.name || projectId}"`,
          activityMetadata
        );
      } else {
        await logActivity(
          db,
          projectId,
          'project.milestone_updated',
          user.sub,
          `Milestone "${milestone.name}" status changed from "${existing.status}" to "${milestone.status}"`,
          { ...activityMetadata, oldStatus: existing.status, newStatus: milestone.status }
        );
      }
    } else {
      await logActivity(
        db,
        projectId,
        'project.milestone_updated',
        user.sub,
        `Milestone "${milestone.name}" was updated`,
        activityMetadata
      );
    }

    return NextResponse.json({ data: milestone });
  } catch (error) {
    console.error('[projects] Update milestone error:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[projectId]/milestones/[milestoneId]
 * Delete a milestone
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, milestoneId } = extractIds(request);
    if (!projectId || !milestoneId) {
      return NextResponse.json({ error: 'Missing project id or milestone id' }, { status: 400 });
    }

    const db = getDb();

    const perm = await requireProjectPermission(db, projectId, user, 'milestones.manage');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Get existing milestone
    const [existing] = await db
      .select()
      .from(projectMilestones)
      .where(
        and(
          eq(projectMilestones.projectId, projectId),
          eq(projectMilestones.id, milestoneId)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Get project for activity log
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    // Delete milestone
    await db
      .delete(projectMilestones)
      .where(
        and(
          eq(projectMilestones.projectId, projectId),
          eq(projectMilestones.id, milestoneId)
        )
      );

    // Log activity
    await logActivity(
      db,
      projectId,
      'project.milestone_deleted',
      user.sub,
      `Milestone "${existing.name}" was deleted from project "${project?.name || projectId}"`,
      { projectId, milestoneId: existing.id, milestoneName: existing.name }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[projects] Delete milestone error:', error);
    return NextResponse.json(
      { error: 'Failed to delete milestone' },
      { status: 500 }
    );
  }
}

