'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProjectStatusRecord } from '../schema/projects';
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
  const [statuses, setStatuses] = useState<ProjectStatusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

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
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch statuses'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if context is not available
    if (!contextValue) {
      refresh();
    }
  }, [refresh, contextValue]);

  const createStatus = async (data: { label: string; color?: string | null; sortOrder?: number; isActive?: boolean }) => {
    const res = await fetch('/api/projects/statuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to create status');
    }
    const json = await res.json();
    await refresh();
    return json;
  };

  const deleteStatus = async (id: string) => {
    const res = await fetch(`/api/projects/statuses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to delete status');
    }
    await refresh();
  };

  // If context is available, use it
  if (contextValue) {
    return { ...contextValue, createStatus, deleteStatus };
  }

  // Otherwise return local state
  const activeStatuses = statuses.filter((s) => s.isActive);

  return { statuses, activeStatuses, loading, error, refresh, createStatus, deleteStatus };
}

/**
 * Hook to get a single project status by ID.
 * Fetches directly from API (no context needed for single-item fetch).
 */
export function useProjectStatus(id: string | undefined) {
  const [status, setStatus] = useState<ProjectStatusRecord | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/statuses/${encodeURIComponent(id)}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to fetch status');
      }
      const json = await res.json();
      setStatus(json?.data ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (data: { label: string; color: string | null; sortOrder: number; isActive: boolean }) => {
    if (!id) throw new Error('Status ID required');
    const res = await fetch(`/api/projects/statuses/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to update status');
    }
    const json = await res.json();
    await fetchData();
    return json;
  };

  const deleteStatus = async () => {
    if (!id) throw new Error('Status ID required');
    const res = await fetch(`/api/projects/statuses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to delete status');
    }
  };

  return { status, loading, error, refresh: fetchData, updateStatus, deleteStatus };
}


