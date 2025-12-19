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
function getPackOptions(request) {
    const user = extractUserFromRequest(request);
    if (!user)
        return {};
    // Feature pack options are stored in JWT claims under featurePacks.projects.options
    const featurePacks = user.featurePacks || {};
    const packConfig = featurePacks['projects'] || {};
    return packConfig.options || {};
}
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
async function getDefaultProjectStatusId(db) {
    // Get the first active status, sorted by sortOrder
    const [row] = await db
        .select({ id: projectStatuses.id })
        .from(projectStatuses)
        .where(eq(projectStatuses.isActive, true))
        .orderBy(asc(projectStatuses.sortOrder))
        .limit(1);
    if (!row) {
        throw new Error('No active project statuses found');
    }
    return row.id;
}
async function getStatusIdByLabel(db, label) {
    const [row] = await db
        .select({ id: projectStatuses.id, isActive: projectStatuses.isActive })
        .from(projectStatuses)
        .where(eq(projectStatuses.label, label))
        .limit(1);
    return row?.isActive ? row.id : null;
}
async function isValidProjectStatusId(db, statusId) {
    const [row] = await db
        .select({ id: projectStatuses.id, isActive: projectStatuses.isActive })
        .from(projectStatuses)
        .where(eq(projectStatuses.id, statusId))
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
        const excludeArchived = searchParams.get('excludeArchived') === 'true';
        const search = searchParams.get('search') || '';
        // Sorting
        const sortBy = searchParams.get('sortBy') || 'createdOnTimestamp';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        // Build where conditions
        const conditions = [];
        if (status) {
            // status param is a status ID (uuid)
            conditions.push(eq(projects.statusId, status));
        }
        if (excludeArchived) {
            // Lookup the 'Archived' status ID to exclude it
            const archivedStatusId = await getStatusIdByLabel(db, 'Archived');
            if (archivedStatusId) {
                conditions.push(sql `${projects.statusId} != ${archivedStatusId}`);
            }
        }
        if (search) {
            conditions.push(or(like(projects.name, `%${search}%`), like(projects.description, `%${search}%`), like(projects.slug, `%${search}%`)));
        }
        // Apply sorting
        const sortColumns = {
            id: projects.id,
            name: projects.name,
            statusId: projects.statusId,
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
        const baseQuery = db
            .select({
            id: projects.id,
            name: projects.name,
            slug: projects.slug,
            description: projects.description,
            statusId: projects.statusId,
            statusLabel: projectStatuses.label,
            statusColor: projectStatuses.color,
            companyId: projects.companyId,
            createdByUserId: projects.createdByUserId,
            createdOnTimestamp: projects.createdOnTimestamp,
            lastUpdatedByUserId: projects.lastUpdatedByUserId,
            lastUpdatedOnTimestamp: projects.lastUpdatedOnTimestamp,
        })
            .from(projects)
            .leftJoin(projectStatuses, eq(projects.statusId, projectStatuses.id));
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
        const options = getPackOptions(request);
        // Validate required fields
        if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }
        // Handle companyId based on feature flags
        let companyId = null;
        if (options.enable_crm_company_association) {
            if (body.companyId) {
                // Validate UUID format
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(body.companyId)) {
                    return NextResponse.json({ error: 'Invalid company ID format' }, { status: 400 });
                }
                companyId = body.companyId;
            }
            else if (options.require_crm_company) {
                return NextResponse.json({ error: 'Company is required for projects' }, { status: 400 });
            }
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
        // Resolve statusId - accept either statusId (uuid) or status (label for backwards compat)
        let resolvedStatusId;
        if (body.statusId) {
            const ok = await isValidProjectStatusId(db, body.statusId);
            if (!ok) {
                return NextResponse.json({ error: `Invalid statusId: ${body.statusId}` }, { status: 400 });
            }
            resolvedStatusId = body.statusId;
        }
        else if (body.status) {
            // Accept label for API backwards compatibility, resolve to ID
            const statusId = await getStatusIdByLabel(db, body.status);
            if (!statusId) {
                return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
            }
            resolvedStatusId = statusId;
        }
        else {
            resolvedStatusId = await getDefaultProjectStatusId(db);
        }
        // Create project
        const [project] = await db
            .insert(projects)
            .values({
            name: body.name.trim(),
            slug,
            description: body.description || null,
            statusId: resolvedStatusId,
            companyId,
            createdByUserId: user.sub,
            lastUpdatedByUserId: user.sub,
        })
            .returning();
        // Log activity
        await logActivity(db, project.id, 'project.created', user.sub, `Project "${project.name}" was created`, { projectId: project.id, projectName: project.name, companyId });
        return NextResponse.json({ data: project }, { status: 201 });
    }
    catch (error) {
        console.error('[projects] Create project error:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
