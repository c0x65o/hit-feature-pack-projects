'use client';

import { useCallback, useEffect, useState } from 'react';

export type AuthGroup = {
  group_id: string;
  group_name: string;
  description?: string | null;
};

function getAuthUrl(): string {
  if (typeof window !== 'undefined') {
    const win = window as unknown as Record<string, string>;
    return win.NEXT_PUBLIC_HIT_AUTH_URL || '/api/proxy/auth';
  }
  return '/api/proxy/auth';
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('hit_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAuthGroups() {
  const [groups, setGroups] = useState<AuthGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${getAuthUrl()}/admin/groups`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.detail || json?.error || `Failed to fetch groups (${res.status})`);
      }
      const json = await res.json();
      const rows = Array.isArray(json) ? json : Array.isArray(json?.groups) ? json.groups : [];
      const normalized: AuthGroup[] = rows
        .map((g: any) => ({
          group_id: String(g.group_id ?? g.id ?? ''),
          group_name: String(g.group_name ?? g.name ?? ''),
          description: g.description ?? null,
        }))
        .filter((g: AuthGroup) => Boolean(g.group_id) && Boolean(g.group_name));
      setGroups(normalized);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch groups'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { groups, loading, error, refresh };
}


