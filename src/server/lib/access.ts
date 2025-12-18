import { getDb } from '@/lib/db';
import { projectGroupRoles } from '@/lib/feature-pack-schemas';
import { and, eq, inArray } from 'drizzle-orm';
import type { User } from '../auth';
import type { ProjectRole } from '../../schema/projects';

export type ProjectPermission =
  | 'project.read'
  | 'project.update'
  | 'project.archive'
  | 'groups.manage'
  | 'milestones.manage'
  | 'links.manage';

export function isAdmin(user: User): boolean {
  return Array.isArray(user.roles) && user.roles.includes('admin');
}

const ROLE_PRECEDENCE: Record<ProjectRole, number> = {
  owner: 4,
  manager: 3,
  contributor: 2,
  viewer: 1,
};

async function fetchAuthGroupIdsByEmail(userEmail: string): Promise<string[]> {
  if (!userEmail) return [];
  try {
    const authUrl = process.env.HIT_AUTH_URL || process.env.NEXT_PUBLIC_HIT_AUTH_URL || '/api/proxy/auth';
    const serviceToken = process.env.HIT_SERVICE_TOKEN;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (serviceToken) {
      headers['X-HIT-Service-Token'] = serviceToken;
    }

    const response = await fetch(
      `${authUrl.replace(/\/$/, '')}/admin/users/${encodeURIComponent(userEmail.toLowerCase())}/groups`,
      { headers }
    );

    if (!response.ok) {
      return [];
    }

    const userGroups = await response.json();
    if (!Array.isArray(userGroups)) return [];

    const ids: string[] = [];
    for (const g of userGroups) {
      if (g?.group_id) ids.push(String(g.group_id));
      else if (g?.groupId) ids.push(String(g.groupId));
      else if (g?.id) ids.push(String(g.id));
    }
    return ids.filter(Boolean);
  } catch {
    return [];
  }
}

export async function getUserGroupIds(db: ReturnType<typeof getDb>, user: User): Promise<string[]> {
  const explicit = Array.isArray(user.groupIds) ? user.groupIds.map(String).filter(Boolean) : [];
  if (explicit.length > 0) return explicit;

  // Last-resort group resolution (until a stable /me/principals contract exists everywhere).
  // Prefer not to call auth admin endpoints long-term.
  if (user.email) {
    const fromAuth = await fetchAuthGroupIdsByEmail(user.email);
    if (fromAuth.length > 0) return fromAuth;
  }

  // If no group IDs are present, treat user as having no project-scoped access.
  return [];
}

export async function getUserProjectRole(
  db: ReturnType<typeof getDb>,
  projectId: string,
  groupIds: string[]
): Promise<ProjectRole | null> {
  if (!Array.isArray(groupIds) || groupIds.length === 0) return null;

  const rows = await db
    .select({ role: projectGroupRoles.role })
    .from(projectGroupRoles)
    .where(and(eq(projectGroupRoles.projectId, projectId), inArray(projectGroupRoles.groupId, groupIds)));

  if (!rows || rows.length === 0) return null;

  // Choose the most privileged role granted by any of the user's groups.
  let best: ProjectRole | null = null;
  let bestScore = 0;
  for (const r of rows) {
    const role = r?.role as ProjectRole | undefined;
    if (!role) continue;
    const score = ROLE_PRECEDENCE[role] || 0;
    if (score > bestScore) {
      bestScore = score;
      best = role;
    }
  }

  return best;
}

export async function requireProjectPermission(
  db: ReturnType<typeof getDb>,
  projectId: string,
  user: User,
  permission: ProjectPermission
): Promise<
  | { ok: true; role: ProjectRole | null; isAdmin: boolean }
  | { ok: false; status: 401 | 403; error: string }
> {
  if (!user) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const admin = isAdmin(user);
  if (admin) {
    return { ok: true, role: 'owner', isAdmin: true };
  }

  const groupIds = await getUserGroupIds(db, user);

  // Reads are open to all authenticated users.
  if (permission === 'project.read') {
    return { ok: true, role: null, isAdmin: false };
  }

  const role = await getUserProjectRole(db, projectId, groupIds);

  // Writes require membership.
  if (!role) {
    return { ok: false, status: 403, error: 'Forbidden' };
  }

  // Role gates
  const isOwner = role === 'owner';
  const isManager = role === 'manager';
  const isContributor = role === 'contributor';

  switch (permission) {
    case 'project.update':
      return isOwner || isManager
        ? { ok: true, role, isAdmin: false }
        : { ok: false, status: 403, error: 'Forbidden' };
    case 'project.archive':
      return isOwner
        ? { ok: true, role, isAdmin: false }
        : { ok: false, status: 403, error: 'Forbidden' };
    case 'groups.manage':
      return isOwner
        ? { ok: true, role, isAdmin: false }
        : { ok: false, status: 403, error: 'Forbidden' };
    case 'milestones.manage':
      return isOwner || isManager || isContributor
        ? { ok: true, role, isAdmin: false }
        : { ok: false, status: 403, error: 'Forbidden' };
    case 'links.manage':
      return isOwner || isManager
        ? { ok: true, role, isAdmin: false }
        : { ok: false, status: 403, error: 'Forbidden' };
    default:
      return { ok: false, status: 403, error: 'Forbidden' };
  }
}


