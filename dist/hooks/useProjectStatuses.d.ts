import type { ProjectStatusRecord } from '../schema/projects';
/**
 * Hook to get project statuses.
 *
 * If wrapped in a ProjectStatusesProvider, it will use the shared context
 * (avoiding N+1 API calls when multiple components need statuses).
 * Otherwise, it fetches statuses directly.
 */
export declare function useProjectStatuses(): {
    createStatus: (data: {
        label: string;
        color?: string | null;
        sortOrder?: number;
        isActive?: boolean;
    }) => Promise<any>;
    deleteStatus: (id: string) => Promise<void>;
    statuses: ProjectStatusRecord[];
    activeStatuses: ProjectStatusRecord[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
/**
 * Hook to get a single project status by ID.
 * Fetches directly from API (no context needed for single-item fetch).
 */
export declare function useProjectStatus(id: string | undefined): {
    status: {
        id: string;
        label: string;
        color: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    updateStatus: (data: {
        label: string;
        color: string | null;
        sortOrder: number;
        isActive: boolean;
    }) => Promise<any>;
};
//# sourceMappingURL=useProjectStatuses.d.ts.map