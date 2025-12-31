import type { Project } from '../schema/projects';
interface UseProjectsOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    statusId?: string;
    excludeArchived?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    /** Advanced view filters (used by table views) */
    filters?: Array<{
        field: string;
        operator: string;
        value: any;
    }>;
    /** How to combine filters: 'all' (AND) or 'any' (OR). Defaults to 'all'. */
    filterMode?: 'all' | 'any';
}
interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
export declare function useProjects(options?: UseProjectsOptions): {
    data: PaginatedResponse<{
        id: string;
        name: string;
        slug: string | null;
        description: string | null;
        statusId: string;
        companyId: string | null;
        createdByUserId: string;
        createdOnTimestamp: Date;
        lastUpdatedByUserId: string | null;
        lastUpdatedOnTimestamp: Date;
    }> | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    createProject: (project: {
        name: string;
        slug?: string;
        description?: string;
        statusId?: string;
    }) => Promise<any>;
    updateProject: (id: string, project: Partial<Project>) => Promise<any>;
    deleteProject: (id: string) => Promise<void>;
};
export declare function useProject(id: string | undefined): {
    project: {
        id: string;
        name: string;
        slug: string | null;
        description: string | null;
        statusId: string;
        companyId: string | null;
        createdByUserId: string;
        createdOnTimestamp: Date;
        lastUpdatedByUserId: string | null;
        lastUpdatedOnTimestamp: Date;
    } | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useProjectActivityTypes(): {
    activityTypes: {
        id: string;
        name: string;
        description: string | null;
        color: string | null;
        sortOrder: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        category: string | null;
        icon: string | null;
        isSystem: boolean;
    }[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useProjectLinks(projectId: string | undefined): {
    links: {
        id: string;
        createdByUserId: string;
        createdOnTimestamp: Date;
        lastUpdatedByUserId: string | null;
        lastUpdatedOnTimestamp: Date;
        projectId: string;
        entityType: string;
        entityId: string;
        metadata: unknown;
    }[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    addLink: (link: {
        entityType: string;
        entityId: string;
        metadata?: Record<string, unknown>;
    }) => Promise<void>;
    removeLink: (linkId: string) => Promise<void>;
};
export declare function useProjectActivity(projectId: string | undefined, filter?: string): {
    activity: {
        id: string;
        description: string | null;
        link: string | null;
        createdAt: Date;
        projectId: string;
        metadata: unknown;
        typeId: string | null;
        activityType: string | null;
        title: string | null;
        userId: string;
        occurredAt: Date;
    }[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    createActivity: (activity: {
        typeId: string;
        title: string;
        description?: string;
        link?: string;
        occurredAt?: string;
    }) => Promise<any>;
};
export interface ProjectFormInfo {
    formId: string;
    formName: string;
    formSlug: string;
    entityFieldKey: string;
    count: number;
}
export interface FormEntryRecord {
    id: string;
    formId: string;
    createdByUserId: string;
    updatedByUserId: string | null;
    data: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}
export interface PaginatedFormEntriesResponse {
    items: FormEntryRecord[];
    fields: any[];
    listConfig: any;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
export {};
//# sourceMappingURL=useProjects.d.ts.map