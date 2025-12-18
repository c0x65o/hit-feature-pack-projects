import type { ProjectStatus } from '../schema/projects';
interface ProjectStatusBadgeProps {
    status: ProjectStatus;
    onChange?: (newStatus: ProjectStatus) => void;
    canChange?: boolean;
}
export declare function ProjectStatusBadge({ status, onChange, canChange }: ProjectStatusBadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProjectStatusBadge.d.ts.map