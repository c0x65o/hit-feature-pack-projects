import type { Project, ProjectMilestone } from '../schema/projects';
interface UseProjectsOptions {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    sortBy?: 'name' | 'lastUpdatedOnTimestamp';
    sortOrder?: 'asc' | 'desc';
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
        status: string;
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
        status?: string;
        ownerGroupId: string;
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
        status: string;
        createdByUserId: string;
        createdOnTimestamp: Date;
        lastUpdatedByUserId: string | null;
        lastUpdatedOnTimestamp: Date;
    } | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export declare function useProjectMilestones(projectId: string | undefined): {
    milestones: {
        id: string;
        name: string;
        description: string | null;
        status: string;
        createdByUserId: string;
        createdOnTimestamp: Date;
        lastUpdatedByUserId: string | null;
        lastUpdatedOnTimestamp: Date;
        projectId: string;
        targetDate: Date | null;
        completedDate: Date | null;
    }[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    createMilestone: (milestone: {
        name: string;
        description?: string;
        targetDate?: string;
        status?: string;
    }) => Promise<void>;
    updateMilestone: (milestoneId: string, milestone: Partial<ProjectMilestone>) => Promise<void>;
    deleteMilestone: (milestoneId: string) => Promise<void>;
};
export declare function useProjectGroups(projectId: string | undefined): {
    groups: {
        id: string;
        createdByUserId: string;
        createdOnTimestamp: Date;
        lastUpdatedByUserId: string | null;
        lastUpdatedOnTimestamp: Date;
        projectId: string;
        groupId: string;
        role: string;
    }[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    addGroup: (groupId: string, role: string) => Promise<void>;
    updateGroupRole: (groupId: string, role: string) => Promise<void>;
    removeGroup: (groupId: string) => Promise<void>;
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
        createdAt: Date;
        projectId: string;
        metadata: unknown;
        activityType: string;
        userId: string;
    }[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
export {};
//# sourceMappingURL=useProjects.d.ts.map