export function isAdmin(user) {
    return Array.isArray(user.roles) && user.roles.includes('admin');
}
export async function requireProjectPermission(_db, _projectId, user, permission) {
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
