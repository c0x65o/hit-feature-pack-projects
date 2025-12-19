'use client';
import { useState, useEffect, useCallback } from 'react';
export function useProjects(options = {}) {
    const { page = 1, pageSize = 25, search = '', status, excludeArchived, sortBy = 'lastUpdatedOnTimestamp', sortOrder = 'desc' } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
                sortBy,
                sortOrder,
            });
            if (search)
                params.set('search', search);
            if (status)
                params.set('status', status);
            if (excludeArchived)
                params.set('excludeArchived', 'true');
            const res = await fetch(`/api/projects?${params.toString()}`);
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Failed to fetch projects');
            }
            const json = await res.json();
            setData(json);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        }
        finally {
            setLoading(false);
        }
    }, [page, pageSize, search, status, excludeArchived, sortBy, sortOrder]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const createProject = async (project) => {
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
    const updateProject = async (id, project) => {
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
    const deleteProject = async (id) => {
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
export function useProject(id) {
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(Boolean(id));
    const [error, setError] = useState(null);
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
    return { project, loading, error, refresh: fetchData };
}
export function useProjectMilestones(projectId) {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(Boolean(projectId));
    const [error, setError] = useState(null);
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
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        }
        finally {
            setLoading(false);
        }
    }, [projectId]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const createMilestone = async (milestone) => {
        if (!projectId)
            throw new Error('Project ID required');
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
    const updateMilestone = async (milestoneId, milestone) => {
        if (!projectId)
            throw new Error('Project ID required');
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
    const deleteMilestone = async (milestoneId) => {
        if (!projectId)
            throw new Error('Project ID required');
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
export function useProjectLinks(projectId) {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(Boolean(projectId));
    const [error, setError] = useState(null);
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
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        }
        finally {
            setLoading(false);
        }
    }, [projectId]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const addLink = async (link) => {
        if (!projectId)
            throw new Error('Project ID required');
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
    const removeLink = async (linkId) => {
        if (!projectId)
            throw new Error('Project ID required');
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
export function useProjectActivity(projectId, filter) {
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(Boolean(projectId));
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        if (!projectId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter)
                params.set('filter', filter);
            const res = await fetch(`/api/projects/${projectId}/activity?${params.toString()}`);
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Failed to fetch activity');
            }
            const json = await res.json();
            setActivity(json?.data ?? []);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        }
        finally {
            setLoading(false);
        }
    }, [projectId, filter]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return { activity, loading, error, refresh: fetchData };
}
export function useProjectForms(projectId) {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(Boolean(projectId));
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        if (!projectId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(`/api/forms/linked?entityKind=project&entityId=${encodeURIComponent(projectId)}`);
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Failed to fetch project forms');
            }
            const json = await res.json();
            setForms(json?.items ?? []);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        }
        finally {
            setLoading(false);
        }
    }, [projectId]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return { forms, loading, error, refresh: fetchData };
}
export function useProjectFormEntries(projectId, formId, options = {}) {
    const { page = 1, pageSize = 25, search = '', sortBy = 'updatedAt', sortOrder = 'desc', entityFieldKey } = options;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(Boolean(projectId && formId));
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        if (!projectId || !formId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: String(page),
                pageSize: String(pageSize),
                sortBy,
                sortOrder,
            });
            if (search)
                params.set('search', search);
            if (entityFieldKey) {
                params.set('linkedEntityKind', 'project');
                params.set('linkedEntityId', projectId);
                params.set('linkedFieldKey', entityFieldKey);
            }
            const res = await fetch(`/api/forms/${formId}/entries?${params.toString()}`);
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Failed to fetch form entries');
            }
            const json = await res.json();
            setData(json);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        }
        finally {
            setLoading(false);
        }
    }, [projectId, formId, page, pageSize, search, sortBy, sortOrder, entityFieldKey]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return { data, loading, error, refresh: fetchData };
}
