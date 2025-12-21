// src/server/api/projects-activity-types-id.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projectActivityTypes } from '@/lib/feature-pack-schemas';
import { eq } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { isAdmin } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Extract ID from URL path
 */
function extractId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const activityTypesIndex = parts.indexOf('activity-types');
  return activityTypesIndex >= 0 && parts[activityTypesIndex + 1] ? parts[activityTypesIndex + 1] : null;
}

/**
 * GET /api/projects/activity-types/[id]
 * Get a specific activity type
 */
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing activity type id' }, { status: 400 });
    }

    const db = getDb();
    const [activityType] = await db
      .select()
      .from(projectActivityTypes)
      .where(eq(projectActivityTypes.id, id))
      .limit(1);

    if (!activityType) {
      return NextResponse.json({ error: 'Activity type not found' }, { status: 404 });
    }

    return NextResponse.json(activityType);
  } catch (error) {
    console.error('[projects] Get activity type error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity type' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/activity-types/[id]
 * Update an activity type (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing activity type id' }, { status: 400 });
    }

    const db = getDb();

    // Check admin permission
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Get existing activity type
    const [existing] = await db
      .select()
      .from(projectActivityTypes)
      .where(eq(projectActivityTypes.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Activity type not found' }, { status: 404 });
    }

    // Prevent modifying system types
    if (existing.isSystem && (body.isActive === false || body.isSystem === false)) {
      return NextResponse.json(
        { error: 'Cannot deactivate or modify system activity types' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.category !== undefined) {
      updates.category = body.category || null;
    }

    if (body.description !== undefined) {
      updates.description = body.description || null;
    }

    if (body.color !== undefined) {
      updates.color = body.color || null;
    }

    if (body.icon !== undefined) {
      updates.icon = body.icon || null;
    }

    if (body.sortOrder !== undefined) {
      updates.sortOrder = body.sortOrder;
    }

    if (body.isActive !== undefined) {
      updates.isActive = body.isActive;
    }

    // Update activity type
    const [activityType] = await db
      .update(projectActivityTypes)
      .set(updates)
      .where(eq(projectActivityTypes.id, id))
      .returning();

    return NextResponse.json(activityType);
  } catch (error) {
    console.error('[projects] Update activity type error:', error);
    return NextResponse.json(
      { error: 'Failed to update activity type' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/activity-types/[id]
 * Delete an activity type (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing activity type id' }, { status: 400 });
    }

    const db = getDb();

    // Check admin permission
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get existing activity type
    const [existing] = await db
      .select()
      .from(projectActivityTypes)
      .where(eq(projectActivityTypes.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Activity type not found' }, { status: 404 });
    }

    // Prevent deleting system types
    if (existing.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system activity types' },
        { status: 400 }
      );
    }

    // Delete activity type
    await db.delete(projectActivityTypes).where(eq(projectActivityTypes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[projects] Delete activity type error:', error);
    return NextResponse.json(
      { error: 'Failed to delete activity type' },
      { status: 500 }
    );
  }
}

