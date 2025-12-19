// src/server/api/projects-statuses-key.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectStatuses, projects } from '@/lib/feature-pack-schemas';
import { eq, sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { isAdmin } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function extractStatusId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const idx = parts.indexOf('statuses');
  return idx >= 0 && parts[idx + 1] ? decodeURIComponent(parts[idx + 1]) : null;
}

function normalizeLabel(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const label = value.trim();
  if (!label) return null;
  if (label.length > 50) return null;
  return label;
}

function requireAdmin(request: NextRequest) {
  const user = extractUserFromRequest(request);
  if (!user) return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!isAdmin(user)) return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { ok: true as const, user };
}

export async function GET(request: NextRequest) {
  try {
    const id = extractStatusId(request);
    if (!id) return NextResponse.json({ error: 'Missing status id' }, { status: 400 });

    const db = getDb();
    const [row] = await db.select().from(projectStatuses).where(eq(projectStatuses.id, id)).limit(1);
    if (!row) return NextResponse.json({ error: 'Status not found' }, { status: 404 });
    return NextResponse.json({ data: row });
  } catch (error) {
    console.error('[projects] Get status error:', error);
    return NextResponse.json({ error: 'Failed to fetch project status' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.res;

    const id = extractStatusId(request);
    if (!id) return NextResponse.json({ error: 'Missing status id' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const db = getDb();

    const [existing] = await db.select().from(projectStatuses).where(eq(projectStatuses.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: 'Status not found' }, { status: 404 });

    const label = body.label !== undefined ? normalizeLabel(body.label) : existing.label;
    if (!label) return NextResponse.json({ error: 'Label is required and must be 50 characters or less' }, { status: 400 });

    // If label changes, check for conflicts
    // NOTE: With FK design (projects.status_id → project_statuses.id),
    // we don't need to update projects when label changes - that's the whole point!
    if (label !== existing.label) {
      const [conflict] = await db
        .select()
        .from(projectStatuses)
        .where(eq(projectStatuses.label, label))
        .limit(1);
      
      if (conflict) {
        return NextResponse.json({ error: 'A status with this label already exists' }, { status: 409 });
      }
    }

    const color = body.color !== undefined ? (typeof body.color === 'string' ? body.color.trim() : null) : existing.color;
    const sortOrder = body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : existing.sortOrder;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive;

    const [updated] = await db
      .update(projectStatuses)
      .set({
        label,
        color,
        sortOrder,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(projectStatuses.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('[projects] Update status error:', error);
    return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = requireAdmin(request);
    if (!admin.ok) return admin.res;

    const id = extractStatusId(request);
    if (!id) return NextResponse.json({ error: 'Missing status id' }, { status: 400 });

    const db = getDb();
    const [existing] = await db.select().from(projectStatuses).where(eq(projectStatuses.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: 'Status not found' }, { status: 404 });

    // Check if any projects use this status by ID (proper FK check)
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.statusId, existing.id));
    if (Number(row?.count ?? 0) > 0) {
      return NextResponse.json({ error: 'Cannot delete a status that is in use by projects' }, { status: 400 });
    }

    await db.delete(projectStatuses).where(eq(projectStatuses.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[projects] Delete status error:', error);
    return NextResponse.json({ error: 'Failed to delete project status' }, { status: 500 });
  }
}


