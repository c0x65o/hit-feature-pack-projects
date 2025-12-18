import type { User } from '../auth';
export type ProjectPermission = 'project.read' | 'project.update' | 'project.archive' | 'milestones.manage' | 'links.manage';
export declare function isAdmin(user: User): boolean;
export declare function requireProjectPermission(_db: unknown, _projectId: string, user: User, permission: ProjectPermission): Promise<{
    ok: true;
    isAdmin: boolean;
} | {
    ok: false;
    status: 401 | 403;
    error: string;
}>;
//# sourceMappingURL=access.d.ts.map