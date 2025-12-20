'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Project, ProjectMilestone, ProjectLink, ProjectActivity } from '../schema/projects';

interface UseProjectsOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  statusId?: string;
  excludeArchived?: boolean;
  sortBy?: 'name' | 'lastUpdatedOnTimestamp';
  sortOrder?: 'asc' | 'desc';
  /** Advanced view filters (used by table views) */
  filters?: Array<{ field: string; operator: string; value: any }>;
  /** How to combine filters: 'all' (AND) or 'any' (OR). Defaults to 'all'. */
  filterMode?: 'all' | 'any';
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

export function useProjects(options: UseProjectsOptions = {}) {
  const { page = 1, pageSize = 25, search = '', statusId, excludeArchived, sortBy = 'lastUpdatedOnTimestamp', sortOrder = 'desc', filters, filterMode = 'all' } = options;
  const [data, setData] = useState<PaginatedResponse<Project> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
      });
      if (search) params.set('search', search);
      if (statusId) params.set('statusId', statusId);
      if (excludeArchived) params.set('excludeArchived', 'true');
      if (filters && Array.isArray(filters) && filters.length > 0) {
        params.set('filters', JSON.stringify(filters));
        params.set('filterMode', filterMode);
      }

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to fetch projects');
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, statusId, excludeArchived, sortBy, sortOrder, filters, filterMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createProject = async (project: { name: string; slug?: string; description?: string; statusId?: string }) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to create project');
    }
    const json = await res.json();
    await fetchData();
    return json;
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to update project');
    }
    const json = await res.json();
    await fetchData();
    return json;
  };

  const deleteProject = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to delete project');
    }
    await fetchData();
  };

  return { data, loading, error, refresh: fetchData, createProject, updateProject, deleteProject };
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to fetch project');
      }
      const json = await res.json();
      setProject(json?.data ?? null);
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

  return { project, loading, error, refresh: fetchData };
}

export function useProjectMilestones(projectId: string | undefined) {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/milestones`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to fetch milestones');
      }
      const json = await res.json();
      setMilestones(json?.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createMilestone = async (milestone: { name: string; description?: string; targetDate?: string; status?: string }) => {
    if (!projectId) throw new Error('Project ID required');
    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(milestone),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to create milestone');
    }
    await fetchData();
  };

  const updateMilestone = async (milestoneId: string, milestone: Partial<ProjectMilestone>) => {
    if (!projectId) throw new Error('Project ID required');
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(milestone),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to update milestone');
    }
    await fetchData();
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!projectId) throw new Error('Project ID required');
    const res = await fetch(`/api/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to delete milestone');
    }
    await fetchData();
  };

  return { milestones, loading, error, refresh: fetchData, createMilestone, updateMilestone, deleteMilestone };
}

export function useProjectLinks(projectId: string | undefined) {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/links`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to fetch links');
      }
      const json = await res.json();
      setLinks(json?.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addLink = async (link: { entityType: string; entityId: string; metadata?: Record<string, unknown> }) => {
    if (!projectId) throw new Error('Project ID required');
    const res = await fetch(`/api/projects/${projectId}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to add link');
    }
    await fetchData();
  };

  const removeLink = async (linkId: string) => {
    if (!projectId) throw new Error('Project ID required');
    const res = await fetch(`/api/projects/${projectId}/links/${linkId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error || 'Failed to remove link');
    }
    await fetchData();
  };

  return { links, loading, error, refresh: fetchData, addLink, removeLink };
}

export function useProjectActivity(projectId: string | undefined, filter?: string) {
  const [activity, setActivity] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter) params.set('filter', filter);
      const res = await fetch(`/api/projects/${projectId}/activity?${params.toString()}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to fetch activity');
      }
      const json = await res.json();
      setActivity(json?.data ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [projectId, filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { activity, loading, error, refresh: fetchData };
}

export interface ProjectFormInfo {
  formId: string;
  formName: string;
  formSlug: string;
  entityFieldKey: string;
  count: number;
}

export interface FormEntryRecord {
  id: string;
  formId: string;
  createdByUserId: string;
  updatedByUserId: string | null;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFormEntriesResponse {
  items: FormEntryRecord[];
  fields: any[];
  listConfig: any;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

