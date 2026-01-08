'use client';
import { useCallback, useEffect, useState } from 'react';
/**
 * Hook to get project activity types.
 */
export function useProjectActivityTypes() {
    const [activityTypes, setActivityTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const refresh = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/projects/activity-types?activeOnly=false');
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Failed to fetch activity types');
            }
            const json = await res.json();
            setActivityTypes(Array.isArray(json?.items) ? json.items : []);
            setError(null);
        }
        catch (e) {
            setError(e instanceof Error ? e : new Error('Failed to fetch activity types'));
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refresh();
    }, [refresh]);
    const createActivityType = async (data) => {
        const res = await fetch('/api/projects/activity-types', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Failed to create activity type');
        }
        const json = await res.json();
        await refresh();
        return json;
    };
    const deleteActivityType = async (id) => {
        const res = await fetch(`/api/projects/activity-types/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Failed to delete activity type');
        }
        await refresh();
    };
    const activeActivityTypes = activityTypes.filter((at) => at.isActive);
    return { activityTypes, activeActivityTypes, loading, error, refresh, createActivityType, deleteActivityType };
}
/**
 * Hook to get a single project activity type by ID.
 */
export function useProjectActivityType(id) {
    const [activityType, setActivityType] = useState(null);
    const [loading, setLoading] = useState(Boolean(id));
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`/api/projects/activity-types/${encodeURIComponent(id)}`);
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Failed to fetch activity type');
            }
            const json = await res.json();
            setActivityType(json ?? null);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        }
        finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const updateActivityType = async (data) => {
        if (!id)
            throw new Error('Activity type ID required');
        const res = await fetch(`/api/projects/activity-types/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Failed to update activity type');
        }
        const json = await res.json();
        await fetchData();
        return json;
    };
    const deleteActivityType = async () => {
        if (!id)
            throw new Error('Activity type ID required');
        const res = await fetch(`/api/projects/activity-types/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            throw new Error(json?.error || 'Failed to delete activity type');
        }
    };
    return { activityType, loading, error, refresh: fetchData, updateActivityType, deleteActivityType };
}
