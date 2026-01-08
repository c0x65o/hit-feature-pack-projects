export type AuthGroup = {
    group_id: string;
    group_name: string;
    description?: string | null;
};
export declare function useAuthGroups(): {
    groups: AuthGroup[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
};
//# sourceMappingURL=useAuthGroups.d.ts.map