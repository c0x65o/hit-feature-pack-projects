/**
 * Hook to get project activity types.
 */
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
    activeActivityTypes: {
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
    createActivityType: (data: {
        key: string;
        name: string;
        category?: string | null;
        description?: string | null;
        color?: string | null;
        icon?: string | null;
        sortOrder?: number;
        isActive?: boolean;
    }) => Promise<any>;
    deleteActivityType: (id: string) => Promise<void>;
};
/**
 * Hook to get a single project activity type by ID.
 */
export declare function useProjectActivityType(id: string | undefined): {
    activityType: {
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
    } | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    updateActivityType: (data: {
        name?: string;
        category?: string | null;
        description?: string | null;
        color?: string | null;
        icon?: string | null;
        sortOrder?: number;
        isActive?: boolean;
    }) => Promise<any>;
    deleteActivityType: () => Promise<void>;
};
//# sourceMappingURL=useProjectActivityTypes.d.ts.map