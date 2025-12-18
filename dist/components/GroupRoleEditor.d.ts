import type { ProjectGroupRole, ProjectRole } from '../schema/projects';
interface GroupRoleEditorProps {
    groups: ProjectGroupRole[];
    onAdd: (groupId: string, role: ProjectRole) => Promise<void>;
    onUpdate: (groupId: string, role: ProjectRole) => Promise<void>;
    onRemove: (groupId: string) => Promise<void>;
    canManage?: boolean;
}
export declare function GroupRoleEditor({ groups, onAdd, onUpdate, onRemove, canManage }: GroupRoleEditorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=GroupRoleEditor.d.ts.map