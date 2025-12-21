// src/server/api/projects-activity.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectActivity, projects, projectActivityTypes } from '@/lib/feature-pack-schemas';
import { eq, desc, and, sql } from 'drizzle-orm';
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
  const projectIndex = parts.indexOf('projects');
  return projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null;
}

/**
 * GET /api/projects/[projectId]/activity
 * List activity log for a project (read-only)
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

    // Get activities with activity type joins
    const activitiesResult = await db
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
      .where(whereClause)
      .orderBy(desc(projectActivity.occurredAt))
      .limit(pageSize)
      .offset(offset);

    // Flatten the response structure
    const activities = activitiesResult.map((row: any) => ({
      ...row,
      activityTypeRecord: row.activityTypeRecord?.id ? row.activityTypeRecord : null,
    }));

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
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
  } catch (error) {
    console.error('[projects] List activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project activity' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[projectId]/activity
 * Create a new activity
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

    const perm = await requireProjectPermission(db, projectId, user, 'project.update');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Validate required fields
    if (!body.typeId || typeof body.typeId !== 'string') {
      return NextResponse.json({ error: 'Activity type ID is required' }, { status: 400 });
    }
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
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

    // Create activity
    const [activity] = await db
      .insert(projectActivity)
      .values({
        projectId,
        typeId: body.typeId,
        title: body.title.trim(),
        description: body.description || null,
        link: body.link || null,
        occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
        userId: user.sub,
      })
      .returning();

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error) {
    console.error('[projects] Create activity error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}

