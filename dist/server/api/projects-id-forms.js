// src/server/api/projects-id-forms.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { formEntries, forms, formVersions, formFields } from '@/lib/feature-pack-schemas';
import { eq, and, sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
/**
 * Extract project ID from URL path
 */
function extractId(request) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/');
    // /api/projects/{projectId}/forms -> projectId is at index 3
    const projectIndex = parts.indexOf('projects');
    return projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null;
}
/**
 * GET /api/projects/[id]/forms
 * Get all forms that have project reference fields, with entry counts for this project
 */
export async function GET(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const projectId = extractId(request);
        if (!projectId) {
            return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
        }
        const db = getDb();
        // Check project permission
        const perm = await requireProjectPermission(db, projectId, user, 'project.read');
        if (!perm.ok) {
            return NextResponse.json({ error: perm.error }, { status: perm.status });
        }
        // Get all published form versions with their fields
        const publishedVersions = await db
            .select({
            versionId: formVersions.id,
            formId: formVersions.formId,
            version: formVersions.version,
        })
            .from(formVersions)
            .where(eq(formVersions.status, 'published'))
            .orderBy(formVersions.version);
        const formsWithProjectFields = [];
        for (const version of publishedVersions) {
            // Get fields for this version
            const fields = await db
                .select()
                .from(formFields)
                .where(eq(formFields.versionId, version.versionId));
            // Find project reference fields
            const projectFields = fields.filter((f) => f.type === 'entity_reference' &&
                f.config &&
                typeof f.config === 'object' &&
                f.config.entity &&
                f.config.entity.kind === 'project');
            if (projectFields.length === 0)
                continue;
            // Get form info
            const [form] = await db
                .select({
                id: forms.id,
                name: forms.name,
                slug: forms.slug,
            })
                .from(forms)
                .where(eq(forms.id, version.formId))
                .limit(1);
            if (!form)
                continue;
            // For each project field, count entries linked to this project
            // Include ALL forms with project reference fields, even if count is 0
            for (const field of projectFields) {
                // Count entries where data contains project reference
                // Entity reference fields store: { entityKind: 'project', entityId: projectId, label?: string }
                // Or as an array: [{ entityKind: 'project', entityId: projectId, label?: string }]
                const countResult = await db
                    .select({ count: sql `count(*)` })
                    .from(formEntries)
                    .where(and(eq(formEntries.formId, version.formId), sql `(
                ${formEntries.data}->${sql.raw(`'${field.key}'`)} @> ${sql.raw(`'{"entityId":"${projectId}"}'`)}::jsonb
                OR ${formEntries.data}->${sql.raw(`'${field.key}'`)} @> ${sql.raw(`'[{"entityId":"${projectId}"}]'`)}::jsonb
              )`));
                const count = Number(countResult[0]?.count || 0);
                // Always include the form, even if count is 0
                formsWithProjectFields.push({
                    formId: form.id,
                    formName: form.name,
                    formSlug: form.slug,
                    projectFieldKey: field.key,
                    count,
                });
            }
        }
        return NextResponse.json({ data: formsWithProjectFields });
    }
    catch (error) {
        console.error('[projects] Get project forms error:', error);
        return NextResponse.json({ error: 'Failed to fetch project forms' }, { status: 500 });
    }
}
