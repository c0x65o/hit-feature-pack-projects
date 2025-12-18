export declare function useProjectStatuses(): {
    statuses: {
        key: string;
        label: string;
        color: string | null;
        sortOrder: number;
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
    activeStatuses: {
        key: string;
        label: string;
        color: string | null;
        sortOrder: number;
        isDefault: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[];
    defaultStatusKey: string;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
//# sourceMappingURL=useProjectStatuses.d.ts.map