// src/server/api/projects.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projects, projectStatuses, projectActivity, } from '@/lib/feature-pack-schemas';
import { eq, desc, asc, like, sql, and, or } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { isAdmin } from '../lib/access';
// Required for Next.js App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * Generate URL-friendly slug from name
 */
function generateSlug(name) {
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
async function logActivity(db, projectId, activityType, userId, description, metadata) {
    await db.insert(projectActivity).values({
        projectId,
        activityType,
        userId,
        description,
        metadata: metadata || null,
    });
}
async function getDefaultProjectStatusKey(db) {
    const [row] = await db
        .select({ key: projectStatuses.key })
        .from(projectStatuses)
        .where(eq(projectStatuses.isDefault, true))
        .limit(1);
    return row?.key || 'active';
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
 * GET /api/projects
 * List all projects (with optional filtering)
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const db = getDb();
        const { searchParams } = new URL(request.url);
        const admin = isAdmin(user);
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
            conditions.push(or(like(projects.name, `%${search}%`), like(projects.description, `%${search}%`), like(projects.slug, `%${search}%`)));
        }
        // Apply sorting
        const sortColumns = {
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
        // All-authenticated read: project visibility is not restricted by group membership.
        const countQuery = db.select({ count: sql `count(*)` }).from(projects);
        const countResult = whereClause ? await countQuery.where(whereClause) : await countQuery;
        const total = Number(countResult[0]?.count || 0);
        const baseQuery = db.select().from(projects);
        const items = whereClause
            ? await baseQuery.where(whereClause).orderBy(orderDirection).limit(pageSize).offset(offset)
            : await baseQuery.orderBy(orderDirection).limit(pageSize).offset(offset);
        return NextResponse.json({
            data: items,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error('[projects] List projects error:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}
/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request) {
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
            return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 });
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
        // Log activity
        await logActivity(db, project.id, 'project.created', user.sub, `Project "${project.name}" was created`, { projectId: project.id, projectName: project.name });
        return NextResponse.json({ data: project }, { status: 201 });
    }
    catch (error) {
        console.error('[projects] Create project error:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
