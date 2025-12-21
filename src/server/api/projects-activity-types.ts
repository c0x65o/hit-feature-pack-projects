// src/server/api/projects-activity-types.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectActivityTypes } from '@/lib/feature-pack-schemas';
import { eq, asc } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { isAdmin } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/projects/activity-types
 * List all activity types
 */
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    let query = db
      .select()
      .from(projectActivityTypes)
      .orderBy(asc(projectActivityTypes.sortOrder), asc(projectActivityTypes.name));

    if (activeOnly) {
      query = query.where(eq(projectActivityTypes.isActive, true)) as typeof query;
    }

    const items = await query;

    return NextResponse.json({ items });
  } catch (error) {
    console.error('[projects] List activity types error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity types' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/activity-types
 * Create a new activity type (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Check admin permission
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      key,
      name,
      category,
      description,
      color,
      icon,
    } = body;

    // Validate required fields
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Validate key format (lowercase, alphanumeric + underscores)
    const keyRegex = /^[a-z0-9_]+$/;
    if (!keyRegex.test(key)) {
      return NextResponse.json(
        { error: 'Key must be lowercase alphanumeric with underscores only' },
        { status: 400 }
      );
    }

    // Check for duplicate key
    const [existing] = await db
      .select({ id: projectActivityTypes.id })
      .from(projectActivityTypes)
      .where(eq(projectActivityTypes.key, key))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'An activity type with this key already exists' },
        { status: 409 }
      );
    }

    // Get max sort order
    const allTypes = await db.select().from(projectActivityTypes);
    const maxSort = Math.max(0, ...allTypes.map((t: any) => t.sortOrder || 0));

    // Create activity type
    const [activityType] = await db
      .insert(projectActivityTypes)
      .values({
        key: key.trim(),
        name: name.trim(),
        category: category || null,
        description: description || null,
        color: color || null,
        icon: icon || null,
        sortOrder: maxSort + 1,
        isSystem: false,
        isActive: true,
      })
      .returning();

    return NextResponse.json(activityType, { status: 201 });
  } catch (error) {
    console.error('[projects] Create activity type error:', error);
    return NextResponse.json(
      { error: 'Failed to create activity type' },
      { status: 500 }
    );
  }
}

