// src/server/api/projects-statuses.ts
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectStatuses } from '@/lib/feature-pack-schemas';
import { asc, eq } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { isAdmin } from '../lib/access';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
function normalizeLabel(value) {
    if (typeof value !== 'string')
        return null;
    const label = value.trim();
    if (!label)
        return null;
    if (label.length > 50)
        return null;
    return label;
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
        const label = normalizeLabel(body.label);
        if (!label) {
            return NextResponse.json({ error: 'Label is required and must be 50 characters or less' }, { status: 400 });
        }
        // Check if label already exists
        const [existing] = await db
            .select()
            .from(projectStatuses)
            .where(eq(projectStatuses.label, label))
            .limit(1);
        if (existing) {
            return NextResponse.json({ error: 'A status with this label already exists' }, { status: 409 });
        }
        const color = typeof body.color === 'string' ? body.color.trim() : null;
        const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0;
        const isActive = body.isActive === undefined ? true : Boolean(body.isActive);
        const [row] = await db
            .insert(projectStatuses)
            .values({
            label,
            color,
            sortOrder,
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
