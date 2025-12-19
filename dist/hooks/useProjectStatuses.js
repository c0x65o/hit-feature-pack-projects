'use client';
import { useCallback, useEffect, useState } from 'react';
import { useProjectStatusesContext } from './ProjectStatusesContext';
/**
 * Hook to get project statuses.
 *
 * If wrapped in a ProjectStatusesProvider, it will use the shared context
 * (avoiding N+1 API calls when multiple components need statuses).
 * Otherwise, it fetches statuses directly.
 */
export function useProjectStatuses() {
    // Try to use context if available (avoids N+1 calls when wrapped in provider)
    const contextValue = useProjectStatusesContext();
    // Local state for when context is not available
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/projects/statuses');
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Failed to fetch statuses');
            }
            const json = await res.json();
            setStatuses(Array.isArray(json?.data) ? json.data : []);
            setError(null);
        }
        catch (e) {
            setError(e instanceof Error ? e : new Error('Failed to fetch statuses'));
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        // Only fetch if context is not available
        if (!contextValue) {
            refresh();
        }
    }, [refresh, contextValue]);
    // If context is available, use it
    if (contextValue) {
        return contextValue;
    }
    // Otherwise return local state
    const activeStatuses = statuses.filter((s) => s.isActive);
    return { statuses, activeStatuses, loading, error, refresh };
}
