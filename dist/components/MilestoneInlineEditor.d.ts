import type { ProjectMilestone } from '../schema/projects';
interface MilestoneInlineEditorProps {
    milestone: ProjectMilestone;
    onUpdate: (id: string, updates: Partial<ProjectMilestone>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    canManage?: boolean;
}
export declare function MilestoneInlineEditor({ milestone, onUpdate, onDelete, canManage }: MilestoneInlineEditorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MilestoneInlineEditor.d.ts.map