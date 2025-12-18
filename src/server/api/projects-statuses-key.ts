// src/server/api/projects-statuses-key.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectStatuses, projects } from '@/lib/feature-pack-schemas';
import { and, eq, sql } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { isAdmin } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function extractStatusKey(request: NextRequest): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const idx = parts.indexOf('statuses');
  return idx >= 0 && parts[idx + 1] ? decodeURIComponent(parts[idx + 1]) : null;
}

function normalizeStatusKey(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const key = value.trim().toLowerCase();
  if (!key) return null;
  if (!/^[a-z][a-z0-9_]*$/.test(key)) return null;
  return key;
}

function requireAdmin(request: NextRequest) {
  const user = extractUserFromRequest(request);
  if (!user) return { ok: false as const, res: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!isAdmin(user)) return { ok: false as const, res: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { ok: true as const, user };
}

export async function GET(request: NextRequest) {
  try {
    const key = extractStatusKey(request);
    if (!key) return NextResponse.json({ error: 'Missing status key' }, { status: 400 });

    const db = getDb();
    const [row] = await db.select().from(projectStatuses).where(eq(projectStatuses.key, key)).limit(1);
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

    const key = extractStatusKey(request);
    if (!key) return NextResponse.json({ error: 'Missing status key' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const db = getDb();

    const [existing] = await db.select().from(projectStatuses).where(eq(projectStatuses.key, key)).limit(1);
    if (!existing) return NextResponse.json({ error: 'Status not found' }, { status: 404 });

    const nextKey = body.key !== undefined ? normalizeStatusKey(body.key) : key;
    if (!nextKey) return NextResponse.json({ error: 'Invalid key. Use lowercase letters/numbers/underscores.' }, { status: 400 });

    const label = body.label !== undefined ? String(body.label || '').trim() : existing.label;
    if (!label) return NextResponse.json({ error: 'Label is required' }, { status: 400 });

    const color = body.color !== undefined ? (typeof body.color === 'string' ? body.color.trim() : null) : existing.color;
    const sortOrder = body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : existing.sortOrder;
    const isActive = body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive;
    const isDefault = body.isDefault !== undefined ? Boolean(body.isDefault) : existing.isDefault;

    // If key changes, ensure no projects still reference the old key (block for now)
    if (nextKey !== key) {
      const [row] = await db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(eq(projects.status, key));
      if (Number(row?.count ?? 0) > 0) {
        return NextResponse.json(
          { error: 'Cannot rename a status key while projects still use it' },
          { status: 400 }
        );
      }
    }

    // If setting a new default, clear existing defaults
    if (isDefault) {
      await db.update(projectStatuses).set({ isDefault: false, updatedAt: new Date() }).where(eq(projectStatuses.isDefault, true));
    }

    // If deactivating the default, block (must always have a default)
    if (existing.isDefault && !isDefault) {
      return NextResponse.json({ error: 'Cannot unset default here; choose another default first' }, { status: 400 });
    }
    if (existing.isDefault && !isActive) {
      return NextResponse.json({ error: 'Cannot deactivate the default status; choose another default first' }, { status: 400 });
    }

    const [updated] = await db
      .update(projectStatuses)
      .set({
        key: nextKey,
        label,
        color,
        sortOrder,
        isActive,
        isDefault,
        updatedAt: new Date(),
      })
      .where(eq(projectStatuses.key, key))
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

    const key = extractStatusKey(request);
    if (!key) return NextResponse.json({ error: 'Missing status key' }, { status: 400 });

    const db = getDb();
    const [existing] = await db.select().from(projectStatuses).where(eq(projectStatuses.key, key)).limit(1);
    if (!existing) return NextResponse.json({ error: 'Status not found' }, { status: 404 });
    if (existing.isDefault) {
      return NextResponse.json({ error: 'Cannot delete the default status' }, { status: 400 });
    }

    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .where(eq(projects.status, key));
    if (Number(row?.count ?? 0) > 0) {
      return NextResponse.json({ error: 'Cannot delete a status that is in use by projects' }, { status: 400 });
    }

    await db.delete(projectStatuses).where(eq(projectStatuses.key, key));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[projects] Delete status error:', error);
    return NextResponse.json({ error: 'Failed to delete project status' }, { status: 500 });
  }
}


