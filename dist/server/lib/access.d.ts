import { getDb } from '@/lib/db';
import type { User } from '../auth';
import type { ProjectRole } from '../../schema/projects';
export type ProjectPermission = 'project.read' | 'project.update' | 'project.archive' | 'groups.manage' | 'milestones.manage' | 'links.manage';
export declare function isAdmin(user: User): boolean;
export declare function getUserGroupIds(db: ReturnType<typeof getDb>, user: User): Promise<string[]>;
export declare function getUserProjectRole(db: ReturnType<typeof getDb>, projectId: string, groupIds: string[]): Promise<ProjectRole | null>;
export declare function requireProjectPermission(db: ReturnType<typeof getDb>, projectId: string, user: User, permission: ProjectPermission): Promise<{
    ok: true;
    role: ProjectRole | null;
    isAdmin: boolean;
} | {
    ok: false;
    status: 401 | 403;
    error: string;
}>;
//# sourceMappingURL=access.d.ts.map