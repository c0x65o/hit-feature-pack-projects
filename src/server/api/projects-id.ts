// src/server/api/projects-id.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { projects, projectStatuses, projectActivity, ACTIVITY_TYPES } from '@/lib/feature-pack-schemas';
import { eq, and } from 'drizzle-orm';
import { extractUserFromRequest } from '../auth';
import { requireProjectPermission } from '../lib/access';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Read feature pack options from JWT claims
 */
interface ProjectsPackOptions {
  enable_crm_company_association?: boolean;
  require_crm_company?: boolean;
}

function getPackOptions(request: NextRequest): ProjectsPackOptions {
  const user = extractUserFromRequest(request);
  if (!user) return {};
  
  // Feature pack options are stored in JWT claims under featurePacks.projects.options
  const featurePacks = (user as any).featurePacks || {};
  const packConfig = featurePacks['projects'] || {};
  return packConfig.options || {};
}

/**
 * Extract project ID from URL path
 */
function extractId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  // /api/projects/{projectId} -> projectId is at index 3 (0=empty, 1=api, 2=projects, 3=projectId)
  const projectIndex = parts.indexOf('projects');
  return projectIndex >= 0 && parts[projectIndex + 1] ? parts[projectIndex + 1] : null;
}

/**
 * Log activity to project_activity table
 */
async function logActivity(
  db: ReturnType<typeof getDb>,
  projectId: string,
  activityType: (typeof ACTIVITY_TYPES)[number],
  userId: string,
  description: string,
  metadata?: Record<string, unknown>
) {
  await db.insert(projectActivity).values({
    projectId,
    activityType,
    userId,
    description,
    metadata: metadata || null,
  });
}

async function isValidProjectStatus(db: ReturnType<typeof getDb>, key: string): Promise<boolean> {
  const [row] = await db
    .select({ key: projectStatuses.key, isActive: projectStatuses.isActive })
    .from(projectStatuses)
    .where(eq(projectStatuses.key, key))
    .limit(1);
  return Boolean(row && row.isActive);
}

/**
 * GET /api/projects/[id]
 * Get a specific project
 */
export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    const db = getDb();

    const perm = await requireProjectPermission(db, id, user, 'project.read');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error('[projects] Get project error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    const body = await request.json();
    const db = getDb();

    const perm = await requireProjectPermission(db, id, user, 'project.update');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Get existing project
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = {
      lastUpdatedByUserId: user.sub,
      lastUpdatedOnTimestamp: new Date(),
    };

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json({ error: 'Project name cannot be empty' }, { status: 400 });
      }
      updates.name = body.name.trim();
    }

    if (body.description !== undefined) {
      updates.description = body.description || null;
    }

    if (body.status !== undefined) {
      const statusKey = String(body.status).trim();
      if (!statusKey) {
        return NextResponse.json({ error: 'Status cannot be empty' }, { status: 400 });
      }
      const ok = await isValidProjectStatus(db, statusKey);
      if (!ok) {
        return NextResponse.json({ error: `Invalid status: ${statusKey}` }, { status: 400 });
      }
      updates.status = statusKey;
    }

    if (body.slug !== undefined) {
      updates.slug = body.slug || null;
    }

    // Handle companyId based on feature flags
    const options = getPackOptions(request);
    if (options.enable_crm_company_association) {
      if (body.companyId !== undefined) {
        if (body.companyId === null || body.companyId === '') {
          // Clearing company association
          if (options.require_crm_company) {
            return NextResponse.json({ error: 'Company is required for projects' }, { status: 400 });
          }
          updates.companyId = null;
        } else {
          // Validate UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(body.companyId)) {
            return NextResponse.json({ error: 'Invalid company ID format' }, { status: 400 });
          }
          updates.companyId = body.companyId;
        }
      }
    }

    // Update project
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();

    // Log activity
    const activityMetadata: Record<string, unknown> = { projectId: project.id };
    
    // Track company changes
    if (updates.companyId !== undefined && updates.companyId !== existing.companyId) {
      activityMetadata.oldCompanyId = existing.companyId;
      activityMetadata.newCompanyId = updates.companyId;
    }
    
    if (body.status && body.status !== existing.status) {
      await logActivity(
        db,
        project.id,
        'project.status_changed',
        user.sub,
        `Project status changed from "${existing.status}" to "${project.status}"`,
        { ...activityMetadata, oldStatus: existing.status, newStatus: project.status }
      );
    } else {
      await logActivity(
        db,
        project.id,
        'project.updated',
        user.sub,
        `Project "${project.name}" was updated`,
        activityMetadata
      );
    }

    return NextResponse.json({ data: project });
  } catch (error) {
    console.error('[projects] Update project error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Permanently delete a project and all related data (cascade deletes handled by DB)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = extractUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = extractId(request);
    if (!id) {
      return NextResponse.json({ error: 'Missing project id' }, { status: 400 });
    }

    const db = getDb();

    const perm = await requireProjectPermission(db, id, user, 'project.archive');
    if (!perm.ok) {
      return NextResponse.json({ error: perm.error }, { status: perm.status });
    }

    // Get existing project before deletion
    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Hard delete - cascade will handle related records (milestones, links, activity, notes)
    await db
      .delete(projects)
      .where(eq(projects.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[projects] Delete project error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

