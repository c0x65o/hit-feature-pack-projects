import type { User } from '../auth';

export type ProjectPermission =
  | 'project.read'
  | 'project.update'
  | 'project.archive'
  | 'links.manage';

export function isAdmin(user: User): boolean {
  return Array.isArray(user.roles) && user.roles.includes('admin');
}

export async function requireProjectPermission(
  _db: unknown,
  _projectId: string,
  user: User,
  permission: ProjectPermission
): Promise<
  | { ok: true; isAdmin: boolean }
  | { ok: false; status: 401 | 403; error: string }
> {
  if (!user) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  const admin = isAdmin(user);

  // All authenticated users can read projects
  if (permission === 'project.read') {
    return { ok: true, isAdmin: admin };
  }

  // All authenticated users can manage projects (no group restrictions)
  // Admin users have full access
  return { ok: true, isAdmin: admin };
}


