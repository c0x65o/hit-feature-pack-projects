'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProjectStatusRecord } from '../schema/projects';

export function useProjectStatuses() {
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
    refresh();
  }, [refresh]);

  const defaultStatusKey = statuses.find((s) => s.isDefault)?.key || 'active';
  const activeStatuses = statuses.filter((s) => s.isActive);

  return { statuses, activeStatuses, defaultStatusKey, loading, error, refresh };
}


