/**
 * Hook to get project statuses.
 *
 * If wrapped in a ProjectStatusesProvider, it will use the shared context
 * (avoiding N+1 API calls when multiple components need statuses).
 * Otherwise, it fetches statuses directly.
 */
export declare function useProjectStatuses(): import("./ProjectStatusesContext").ProjectStatusesContextValue;
//# sourceMappingURL=useProjectStatuses.d.ts.map