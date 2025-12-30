// src/server/api/projects.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projects, projectStatuses, projectActivity, } from '@/lib/feature-pack-schemas';
import { eq, desc, asc, like, sql, and, or, gte } from 'drizzle-orm';
import { pgTable, varchar, timestamp, numeric } from 'drizzle-orm/pg-core';
import { extractUserFromRequest } from '../auth';
import { isAdmin } from '../lib/access';
// Required for Next.js App Router
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// NOTE:
// This feature pack builds in isolation, so it cannot rely on other feature packs'
// schemas being present in '@/lib/feature-pack-schemas' during `tsc`.
// We define the minimal shape we need for metric-backed sorting locally.
const metricsMetricPoints = pgTable('metrics_metric_points', {
    entityKind: varchar('entity_kind', { length: 50 }).notNull(),
    entityId: varchar('entity_id', { length: 255 }).notNull(),
    metricKey: varchar('metric_key', { length: 100 }).notNull(),
    date: timestamp('date').notNull(),
    value: numeric('value', { precision: 20, scale: 4 }).notNull(),
});
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
        const statusId = searchParams.get('statusId');
        const excludeArchived = searchParams.get('excludeArchived') === 'true';
        const search = searchParams.get('search') || '';
        const filtersRaw = searchParams.get('filters');
        const filterModeRaw = searchParams.get('filterMode');
        const filterMode = filterModeRaw === 'any' ? 'any' : 'all';
        // Sorting
        const sortBy = searchParams.get('sortBy') || 'createdOnTimestamp';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        // Build where conditions
        const conditions = [];
        if (statusId) {
            // statusId param is a status ID (uuid)
            conditions.push(eq(projects.statusId, statusId));
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
        // Advanced view filters (used by table views)
        const viewFilterConditions = [];
        if (filtersRaw) {
            try {
                const parsed = JSON.parse(filtersRaw);
                const filters = Array.isArray(parsed) ? parsed : [];
                for (const f of filters) {
                    const field = String(f?.field || '');
                    const operator = String(f?.operator || '');
                    const value = f?.value;
                    if (!field || !operator)
                        continue;
                    // Supported fields: name, statusId, lastUpdatedOnTimestamp
                    if (field === 'name') {
                        const v = value === null || value === undefined ? '' : String(value);
                        if (operator === 'isNull')
                            viewFilterConditions.push(sql `${projects.name} is null`);
                        else if (operator === 'isNotNull')
                            viewFilterConditions.push(sql `${projects.name} is not null`);
                        else if (operator === 'equals')
                            viewFilterConditions.push(eq(projects.name, v));
                        else if (operator === 'notEquals')
                            viewFilterConditions.push(sql `${projects.name} != ${v}`);
                        else if (operator === 'contains')
                            viewFilterConditions.push(like(projects.name, `%${v}%`));
                        else if (operator === 'notContains')
                            viewFilterConditions.push(sql `NOT (${projects.name} LIKE ${`%${v}%`})`);
                        else if (operator === 'startsWith')
                            viewFilterConditions.push(like(projects.name, `${v}%`));
                        else if (operator === 'endsWith')
                            viewFilterConditions.push(like(projects.name, `%${v}`));
                    }
                    else if (field === 'statusId') {
                        const v = value === null || value === undefined ? '' : String(value);
                        if (operator === 'isNull')
                            viewFilterConditions.push(sql `${projects.statusId} is null`);
                        else if (operator === 'isNotNull')
                            viewFilterConditions.push(sql `${projects.statusId} is not null`);
                        else if (operator === 'equals' && v)
                            viewFilterConditions.push(eq(projects.statusId, v));
                        else if (operator === 'notEquals' && v)
                            viewFilterConditions.push(sql `${projects.statusId} != ${v}`);
                    }
                    else if (field === 'lastUpdatedOnTimestamp') {
                        // Expect yyyy-mm-dd from the UI for date filters
                        const v = value === null || value === undefined ? '' : String(value);
                        if (!v)
                            continue;
                        if (operator === 'dateEquals')
                            viewFilterConditions.push(sql `${projects.lastUpdatedOnTimestamp}::date = ${v}`);
                        else if (operator === 'dateBefore')
                            viewFilterConditions.push(sql `${projects.lastUpdatedOnTimestamp}::date < ${v}`);
                        else if (operator === 'dateAfter')
                            viewFilterConditions.push(sql `${projects.lastUpdatedOnTimestamp}::date > ${v}`);
                        else if (operator === 'isNull')
                            viewFilterConditions.push(sql `${projects.lastUpdatedOnTimestamp} is null`);
                        else if (operator === 'isNotNull')
                            viewFilterConditions.push(sql `${projects.lastUpdatedOnTimestamp} is not null`);
                    }
                }
            }
            catch {
                // Ignore bad filters payloads
            }
        }
        if (viewFilterConditions.length > 0) {
            conditions.push(filterMode === 'any' ? or(...viewFilterConditions) : and(...viewFilterConditions));
        }
        // Apply sorting (supports metric-backed sort keys too)
        const sortColumns = {
            id: projects.id,
            name: projects.name,
            statusId: projects.statusId,
            createdOnTimestamp: projects.createdOnTimestamp,
            lastUpdatedOnTimestamp: projects.lastUpdatedOnTimestamp,
        };
        const metricSortKey = String(sortBy || '').trim();
        const isMetricSort = metricSortKey === 'revenue_30d_usd';
        let orderDirection = null;
        let metricJoin = null;
        let metricOn = null;
        let metricSelect = {};
        if (isMetricSort) {
            // revenue_30d_usd = sum(revenue_usd) over last 30 days (missing treated as 0)
            const dayMs = 24 * 60 * 60 * 1000;
            const start = new Date(Date.now() - 30 * dayMs);
            const rev = db
                .select({
                entityId: metricsMetricPoints.entityId,
                revenue: sql `sum(${metricsMetricPoints.value})::float8`.as('revenue'),
            })
                .from(metricsMetricPoints)
                .where(and(eq(metricsMetricPoints.entityKind, 'project'), eq(metricsMetricPoints.metricKey, 'revenue_usd'), gte(metricsMetricPoints.date, start)))
                .groupBy(metricsMetricPoints.entityId)
                .as('rev_30d');
            metricJoin = rev;
            metricOn = sql `${projects.id}::text = ${rev.entityId}`;
            const sortExpr = sql `coalesce(${rev.revenue}, 0)`;
            orderDirection = sortOrder === 'asc' ? asc(sortExpr) : desc(sortExpr);
            metricSelect = {
                revenue_30d_usd: sql `coalesce(${rev.revenue}, 0)`.as('revenue_30d_usd'),
            };
        }
        else {
            const orderCol = sortColumns[sortBy] ?? projects.createdOnTimestamp;
            orderDirection = sortOrder === 'asc' ? asc(orderCol) : desc(orderCol);
        }
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
            statusSortOrder: projectStatuses.sortOrder,
            companyId: projects.companyId,
            createdByUserId: projects.createdByUserId,
            createdOnTimestamp: projects.createdOnTimestamp,
            lastUpdatedByUserId: projects.lastUpdatedByUserId,
            lastUpdatedOnTimestamp: projects.lastUpdatedOnTimestamp,
            ...metricSelect,
        })
            .from(projects)
            .leftJoin(projectStatuses, eq(projects.statusId, projectStatuses.id));
        if (metricJoin) {
            baseQuery.leftJoin(metricJoin, metricOn);
        }
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
        // Resolve statusId (canonical)
        let resolvedStatusId;
        if (body.statusId) {
            const ok = await isValidProjectStatusId(db, body.statusId);
            if (!ok) {
                return NextResponse.json({ error: `Invalid statusId: ${body.statusId}` }, { status: 400 });
            }
            resolvedStatusId = body.statusId;
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
