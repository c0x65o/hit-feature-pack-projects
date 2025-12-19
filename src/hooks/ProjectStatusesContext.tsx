'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { ProjectStatusRecord } from '../schema/projects';

export interface ProjectStatusesContextValue {
  statuses: ProjectStatusRecord[];
  activeStatuses: ProjectStatusRecord[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const ProjectStatusesContext = createContext<ProjectStatusesContextValue | null>(null);

export function ProjectStatusesProvider({ children }: { children: ReactNode }) {
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

  const activeStatuses = statuses.filter((s) => s.isActive);

  return (
    <ProjectStatusesContext.Provider
      value={{ statuses, activeStatuses, loading, error, refresh }}
    >
      {children}
    </ProjectStatusesContext.Provider>
  );
}

export function useProjectStatusesContext(): ProjectStatusesContextValue | null {
  return useContext(ProjectStatusesContext);
}

