import { type ReactNode } from 'react';
import type { ProjectStatusRecord } from '../schema/projects';
export interface ProjectStatusesContextValue {
    statuses: ProjectStatusRecord[];
    activeStatuses: ProjectStatusRecord[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}
export declare function ProjectStatusesProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useProjectStatusesContext(): ProjectStatusesContextValue | null;
//# sourceMappingURL=ProjectStatusesContext.d.ts.map