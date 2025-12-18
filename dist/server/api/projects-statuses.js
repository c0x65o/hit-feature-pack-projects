// src/server/api/projects-statuses.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectStatuses } from '@/lib/feature-pack-schemas';
import { asc, eq } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { isAdmin } from '../lib/access';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
function normalizeStatusKey(value) {
    if (typeof value !== 'string')
        return null;
    const key = value.trim().toLowerCase();
    if (!key)
        return null;
    if (!/^[a-z][a-z0-9_]*$/.test(key))
        return null;
    return key;
}
/**
 * GET /api/projects/statuses
 * List status catalog (public; used by Projects UI)
 */
export async function GET() {
    try {
        const db = getDb();
        const rows = await db
            .select()
            .from(projectStatuses)
            .orderBy(asc(projectStatuses.sortOrder), asc(projectStatuses.label));
        return NextResponse.json({ data: rows });
    }
    catch (error) {
        console.error('[projects] List statuses error:', error);
        return NextResponse.json({ error: 'Failed to fetch project statuses' }, { status: 500 });
    }
}
/**
 * POST /api/projects/statuses
 * Create a new status (admin only)
 */
export async function POST(request) {
    try {
        const user = extractUserFromRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        if (!isAdmin(user)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await request.json().catch(() => ({}));
        const db = getDb();
        const key = normalizeStatusKey(body.key);
        if (!key) {
            return NextResponse.json({ error: 'Invalid key. Use lowercase letters/numbers/underscores.' }, { status: 400 });
        }
        const label = typeof body.label === 'string' ? body.label.trim() : '';
        if (!label) {
            return NextResponse.json({ error: 'Label is required' }, { status: 400 });
        }
        const color = typeof body.color === 'string' ? body.color.trim() : null;
        const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
        const isDefault = Boolean(body.isDefault);
        const isActive = body.isActive === undefined ? true : Boolean(body.isActive);
        // If setting a new default, clear existing defaults
        if (isDefault) {
            await db.update(projectStatuses).set({ isDefault: false, updatedAt: new Date() }).where(eq(projectStatuses.isDefault, true));
        }
        const [row] = await db
            .insert(projectStatuses)
            .values({
            key,
            label,
            color,
            sortOrder,
            isDefault,
            isActive,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        return NextResponse.json({ data: row }, { status: 201 });
    }
    catch (error) {
        console.error('[projects] Create status error:', error);
        return NextResponse.json({ error: 'Failed to create project status' }, { status: 500 });
    }
}
