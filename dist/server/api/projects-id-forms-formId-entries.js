// src/server/api/projects-id-forms-formId-entries.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { formEntries, forms, formVersions, formFields, formsAcls } from '@/lib/feature-pack-schemas';
import { eq, and, asc, desc, like, sql, or } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * Check if user has a specific ACL permission on a form
 */
async function hasFormPermission(db, formId, userId, roles, permission) {
    const principalIds = [userId, ...roles].filter(Boolean);
    if (principalIds.length === 0)
        return false;
    const aclEntries = await db
        .select()
        .from(formsAcls)
        .where(and(eq(formsAcls.formId, formId), or(...principalIds.map((id) => eq(formsAcls.principalId, id)))));
    if (aclEntries.length === 0)
        return false;
    const allPermissions = aclEntries.flatMap((e) => e.permissions || []);
    return allPermissions.includes(permission);
}
/**
 * Extract project ID and form ID from URL path
 * /api/projects/{projectId}/forms/{formId}/entries
 */
function extractIds(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    const projectIndex = parts.indexOf('projects');
    const formsIndex = parts.indexOf('forms');
    const entriesIndex = parts.indexOf('entries');
    const projectId = projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null;
    const formId = formsIndex >= 0 && parts[formsIndex + 1] ? parts[formsIndex + 1] : null;
    return { projectId, formId };
}
/**
 * GET /api/projects/[id]/forms/[formId]/entries
 * Get form entries filtered by project ID
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user?.sub) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { projectId, formId } = extractIds(request);
        if (!projectId) {
            return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
        }
        if (!formId) {
            return NextResponse.json({ error: 'Missing form id' }, { status: 400 });
        }
        const db = getDb();
        // Check project permission
        const perm = await requireProjectPermission(db, projectId, user, 'project.read');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        // Check form ACL - need READ permission
        const FORM_PERMISSIONS = {
            READ: 'form.read',
            WRITE: 'form.write',
        };
        const hasAccess = await hasFormPermission(db, formId, user.sub, user.roles || [], FORM_PERMISSIONS.READ);
        if (!hasAccess) {
            return NextResponse.json({ error: 'Not authorized to read form' }, { status: 403 });
        }
        // Get form
        const [form] = await db
            .select()
            .from(forms)
            .where(eq(forms.id, formId))
            .limit(1);
        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }
        // Get published version to find project field
        const [publishedVersion] = await db
            .select()
            .from(formVersions)
            .where(and(eq(formVersions.formId, formId), eq(formVersions.status, 'published')))
            .orderBy(desc(formVersions.version))
            .limit(1);
        if (!publishedVersion) {
            return NextResponse.json({ error: 'Form has no published version' }, { status: 404 });
        }
        // Get fields to find project reference field
        const fields = await db
            .select()
            .from(formFields)
            .where(eq(formFields.versionId, publishedVersion.id));
        const { searchParams } = new URL(request.url);
        // Use passed projectFieldKey if available, otherwise find it from fields
        const passedFieldKey = searchParams.get('projectFieldKey');
        let projectFieldKey;
        if (passedFieldKey) {
            // Use the field key that was passed (from the forms endpoint)
            projectFieldKey = passedFieldKey;
        }
        else {
            // Fallback: find project reference field in current version
            const projectField = fields.find((f) => f.type === 'entity_reference' &&
                f.config &&
                typeof f.config === 'object' &&
                f.config.entity &&
                f.config.entity.kind === 'project');
            if (!projectField) {
                return NextResponse.json({ error: 'Form does not have a project reference field' }, { status: 400 });
            }
            projectFieldKey = projectField.key;
        }
        // Pagination
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);
        const offset = (page - 1) * pageSize;
        // Sorting
        const sortBy = searchParams.get('sortBy') || 'updatedAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';
        // Search
        const search = searchParams.get('search') || '';
        // Build entry conditions - filter by project ID in the project field
        // Entity reference fields store: { entityKind: 'project', entityId: projectId, label?: string }
        // Or as an array: [{ entityKind: 'project', entityId: projectId, label?: string }]
        console.log('[projects] Fetching entries for project:', projectId, 'form:', formId, 'field:', projectFieldKey);
        const conditions = [
            eq(formEntries.formId, formId),
            sql `(
        ${formEntries.data}->${sql.raw(`'${projectFieldKey}'`)} @> ${sql.raw(`'{"entityId":"${projectId}"}'`)}::jsonb
        OR ${formEntries.data}->${sql.raw(`'${projectFieldKey}'`)} @> ${sql.raw(`'[{"entityId":"${projectId}"}]'`)}::jsonb
      )`,
        ];
        // Search
        if (search) {
            conditions.push(like(formEntries.searchText, `%${search}%`));
        }
        // Sorting
        const sortColumns = {
            createdAt: formEntries.createdAt,
            updatedAt: formEntries.updatedAt,
        };
        const orderCol = sortColumns[sortBy] ?? formEntries.updatedAt;
        const orderDirection = sortOrder === 'asc' ? asc(orderCol) : desc(orderCol);
        const whereClause = and(...conditions);
        // Get count
        const [countResult] = await db
            .select({ count: sql `count(*)` })
            .from(formEntries)
            .where(whereClause);
        const total = Number(countResult?.count || 0);
        console.log('[projects] Entry count for project filter:', total);
        // Get entries
        const entries = await db
            .select()
            .from(formEntries)
            .where(whereClause)
            .orderBy(orderDirection)
            .limit(pageSize)
            .offset(offset);
        console.log('[projects] Fetched entries:', entries.length);
        return NextResponse.json({
            items: entries,
            fields,
            listConfig: publishedVersion.listConfig || null,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        console.error('[projects] Get project form entries error:', error);
        return NextResponse.json({ error: 'Failed to fetch form entries' }, { status: 500 });
    }
}
