// src/server/api/projects-groups.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  projectGroupRoles,
  projects,
  projectActivity,
  ACTIVITY_TYPES,
  PROJECT_ROLES,
} from '@/lib/feature-pack-schemas';
import { eq, desc, and } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Extract project ID from URL path
 */
function extractProjectId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  // /api/projects/{projectId}/groups -> projectId is at index 3
  const projectIndex = parts.indexOf('projects');
  return projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null;
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
 * GET /api/projects/[projectId]/groups
 * List all auth groups granted roles on a project
 */
export async function GET(request: NextRequest) {
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
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const groups = await db
      .select()
      .from(projectGroupRoles)
      .where(eq(projectGroupRoles.projectId, projectId))
      .orderBy(desc(projectGroupRoles.createdOnTimestamp));

    return NextResponse.json({ data: groups });
  } catch (error) {
    console.error('[projects] List groups error:', error);
    return NextResponse.json({ error: 'Failed to fetch project groups' }, { status: 500 });
  }
}

/**
 * POST /api/projects/[projectId]/groups
 * Grant a group a role on a project
 */
export async function POST(request: NextRequest) {
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

    const perm = await requireProjectPermission(db, projectId, user, 'groups.manage');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    if (!body.groupId || typeof body.groupId !== 'string') {
      return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
    }

    const groupId = body.groupId.trim();
    if (!groupId) {
      return NextResponse.json({ error: 'groupId is required' }, { status: 400 });
    }

    const role = body.role || 'contributor';
    if (!PROJECT_ROLES.includes(role as (typeof PROJECT_ROLES)[number])) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${PROJECT_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const existing = await db
      .select()
      .from(projectGroupRoles)
      .where(and(eq(projectGroupRoles.projectId, projectId), eq(projectGroupRoles.groupId, groupId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'Group already has access to this project' }, { status: 409 });
    }

    const [groupRole] = await db
      .insert(projectGroupRoles)
      .values({
        projectId,
        groupId,
        role: role as (typeof PROJECT_ROLES)[number],
        createdByUserId: user.sub,
        lastUpdatedByUserId: user.sub,
      })
      .returning();

    await logActivity(
      db,
      projectId,
      'project.group_added',
      user.sub,
      `Group ${groupId} was granted role ${role} on project "${project.name}"`,
      { projectId, groupId, role }
    );

    return NextResponse.json({ data: groupRole }, { status: 201 });
  } catch (error) {
    console.error('[projects] Add group error:', error);
    return NextResponse.json({ error: 'Failed to add project group' }, { status: 500 });
  }
}


