// src/server/api/projects.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  projects,
  projectGroupRoles,
  projectStatuses,
  projectActivity,
  ACTIVITY_TYPES,
  type Project,
} from '@/lib/feature-pack-schemas';
import { eq, desc, asc, like, sql, and, or, inArray, type AnyColumn } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { isProjectsGroupsOnlyRead } from '../lib/policy';
import { getUserGroupIds, isAdmin } from '../lib/access';

// Required for Next.js App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Generate URL-friendly slug from name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

async function getDefaultProjectStatusKey(db: ReturnType<typeof getDb>): Promise<string> {
  const [row] = await db
    .select({ key: projectStatuses.key })
    .from(projectStatuses)
    .where(eq(projectStatuses.isDefault, true))
    .limit(1);
  return row?.key || 'active';
}

async function isValidProjectStatus(db: ReturnType<typeof getDb>, key: string): Promise<boolean> {
  const [row] = await db
    .select({ key: projectStatuses.key, isActive: projectStatuses.isActive })
    .from(projectStatuses)
    .where(eq(projectStatuses.key, key))
    .limit(1);
  return Boolean(row && row.isActive);
}

/**
 * GET /api/projects
 * List all projects (with optional filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const groupsOnlyRead = isProjectsGroupsOnlyRead();

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
    const offset = (page - 1) * pageSize;

    // Filtering
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdOnTimestamp';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(projects.status, status));
    }
    if (search) {
      conditions.push(
        or(
          like(projects.name, `%${search}%`),
          like(projects.description, `%${search}%`),
          like(projects.slug, `%${search}%`)
        )!
      );
    }

    // Apply sorting
    const sortColumns: Record<string, AnyColumn> = {
      id: projects.id,
      name: projects.name,
      status: projects.status,
      createdOnTimestamp: projects.createdOnTimestamp,
      lastUpdatedOnTimestamp: projects.lastUpdatedOnTimestamp,
    };
    const orderCol = sortColumns[sortBy] ?? projects.createdOnTimestamp;
    const orderDirection = sortOrder === 'asc' ? asc(orderCol) : desc(orderCol);

    // Build where clause
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    if (groupsOnlyRead) {
      const groupIds = await getUserGroupIds(db, user);
      if (groupIds.length === 0) {
        return NextResponse.json({
          items: [],
          pagination: { page, pageSize, total: 0, totalPages: 0 },
        });
      }

      const countConditions = [inArray(projectGroupRoles.groupId, groupIds)];
      if (whereClause) countConditions.push(whereClause);
      const groupsOnlyWhere = and(...countConditions);

      const countResult = await db
        .select({ count: sql<number>`count(distinct ${projects.id})` })
        .from(projects)
        .innerJoin(projectGroupRoles, eq(projectGroupRoles.projectId, projects.id))
        .where(groupsOnlyWhere);
      const total = Number(countResult[0]?.count || 0);

      const results = await db
        .selectDistinct({ project: projects })
        .from(projects)
        .innerJoin(projectGroupRoles, eq(projectGroupRoles.projectId, projects.id))
        .where(groupsOnlyWhere)
        .orderBy(orderDirection)
        .limit(pageSize)
        .offset(offset);

      const items = results.map((r: { project: Project }) => r.project);

      return NextResponse.json({
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      });
    }

    // All-authenticated read (default)
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(projects);
    const countResult = whereClause ? await countQuery.where(whereClause) : await countQuery;
    const total = Number(countResult[0]?.count || 0);

    const baseQuery = db.select().from(projects);
    const items = whereClause
      ? await baseQuery.where(whereClause).orderBy(orderDirection).limit(pageSize).offset(offset)
      : await baseQuery.orderBy(orderDirection).limit(pageSize).offset(offset);

    return NextResponse.json({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('[projects] List projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();

    // Validate required fields
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Generate slug if not provided
    const slug = body.slug || generateSlug(body.name);

    // Check if slug already exists
    const existing = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'A project with this slug already exists' },
        { status: 409 }
      );
    }

    // Determine owner group (project-scoped access is via Auth groups, not per-user membership)
    const groupIds = await getUserGroupIds(db, user);
    const admin = isAdmin(user);
    const requestedOwnerGroupId =
      typeof body.ownerGroupId === 'string' && body.ownerGroupId.trim() ? body.ownerGroupId.trim() : null;
    const ownerGroupId = requestedOwnerGroupId || groupIds[0] || null;

    if (!ownerGroupId) {
      return NextResponse.json(
        { error: 'Project requires an owner group. Provide ownerGroupId or ensure the user has at least one group.' },
        { status: 400 }
      );
    }

    if (!admin && !groupIds.includes(ownerGroupId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (body.status !== undefined && body.status !== null) {
      const statusKey = String(body.status).trim();
      if (!statusKey) {
        return NextResponse.json({ error: 'Status cannot be empty' }, { status: 400 });
      }
      const ok = await isValidProjectStatus(db, statusKey);
      if (!ok) {
        return NextResponse.json({ error: `Invalid status: ${statusKey}` }, { status: 400 });
      }
      body.status = statusKey;
    }

    // Create project
    const [project] = await db
      .insert(projects)
      .values({
        name: body.name.trim(),
        slug,
        description: body.description || null,
        status: body.status || (await getDefaultProjectStatusKey(db)),
        createdByUserId: user.sub,
        lastUpdatedByUserId: user.sub,
      })
      .returning();

    // Grant the owner group the project owner role
    await db.insert(projectGroupRoles).values({
      projectId: project.id,
      groupId: ownerGroupId,
      role: 'owner',
      createdByUserId: user.sub,
      lastUpdatedByUserId: user.sub,
    });

    // Log activity
    await logActivity(
      db,
      project.id,
      'project.created',
      user.sub,
      `Project "${project.name}" was created`,
      { projectId: project.id, projectName: project.name, ownerGroupId }
    );

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error('[projects] Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

