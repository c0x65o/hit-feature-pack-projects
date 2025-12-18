'use client';

import React, { useMemo, useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

type StatusRow = {
  key: string;
  label: string;
  color: string | null;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
};

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || json?.detail || `Request failed (${res.status})`);
  }
  return json;
}

export function ProjectStatusesSetup() {
  const { Page, Card, Button, Input, Select, Table } = useUi();
  const { statuses, loading, error, refresh } = useProjectStatuses();

  const [newKey, setNewKey] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#64748b');
  const [newSortOrder, setNewSortOrder] = useState('0');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [newIsActive, setNewIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const rows: StatusRow[] = useMemo(
    () =>
      statuses.map((s) => ({
        key: s.key,
        label: s.label,
        color: s.color ?? null,
        sortOrder: s.sortOrder,
        isDefault: s.isDefault,
        isActive: s.isActive,
      })),
    [statuses]
  );

  const createStatus = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await fetchJson('/api/projects/statuses', {
        method: 'POST',
        body: JSON.stringify({
          key: newKey,
          label: newLabel,
          color: newColor,
          sortOrder: Number(newSortOrder || 0),
          isDefault: newIsDefault,
          isActive: newIsActive,
        }),
      });
      setNewKey('');
      setNewLabel('');
      setNewColor('#64748b');
      setNewSortOrder('0');
      setNewIsDefault(false);
      setNewIsActive(true);
      await refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create status');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (key: string, patch: Partial<StatusRow>) => {
    setSaveError(null);
    setSaving(true);
    try {
      await fetchJson(`/api/projects/statuses/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      await refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const deleteStatus = async (key: string) => {
    if (!confirm(`Delete status "${key}"?`)) return;
    setSaveError(null);
    setSaving(true);
    try {
      await fetchJson(`/api/projects/statuses/${encodeURIComponent(key)}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to delete status');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'key',
      label: 'Key',
      render: (_v: unknown, row: Record<string, unknown>) => <code>{String((row as any).key)}</code>,
    },
    {
      key: 'label',
      label: 'Label',
      render: (_v: unknown, row: Record<string, unknown>) => String((row as any).label),
    },
    {
      key: 'isActive',
      label: 'Active',
      render: (_v: unknown, row: Record<string, unknown>) => (Boolean((row as any).isActive) ? 'Yes' : 'No'),
    },
    {
      key: 'isDefault',
      label: 'Default',
      render: (_v: unknown, row: Record<string, unknown>) => (Boolean((row as any).isDefault) ? 'Yes' : 'No'),
    },
    {
      key: 'actions',
      label: '',
      render: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as any as StatusRow;
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={() => updateStatus(r.key, { isDefault: true })}
            >
              Set default
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={() => updateStatus(r.key, { isActive: !r.isActive })}
            >
              {r.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="ghost" size="sm" disabled={saving || r.isDefault} onClick={() => deleteStatus(r.key)}>
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Page title="Project Statuses (Setup)">
      <Card title="Status Catalog">
        <div style={{ fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '12px' }}>
          Seeded by migrations; editable here (admin).
        </div>
        {error ? (
          <div style={{ padding: '12px', color: 'var(--hit-error, #ef4444)' }}>{error.message}</div>
        ) : null}
        {saveError ? (
          <div style={{ padding: '12px', color: 'var(--hit-error, #ef4444)' }}>{saveError}</div>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '12px' }}>
            <Input label="Key" value={newKey} onChange={setNewKey} placeholder="e.g. active" disabled={saving} />
            <Input label="Label" value={newLabel} onChange={setNewLabel} placeholder="e.g. Active" disabled={saving} />
            <Input label="Color" value={newColor} onChange={setNewColor} placeholder="#22c55e" disabled={saving} />
            <Input
              label="Sort"
              value={newSortOrder}
              onChange={setNewSortOrder}
              placeholder="0"
              disabled={saving}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <Select
              label="Default?"
              value={newIsDefault ? 'yes' : 'no'}
              onChange={(v) => setNewIsDefault(String(v) === 'yes')}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
              disabled={saving}
            />
            <Select
              label="Active?"
              value={newIsActive ? 'yes' : 'no'}
              onChange={(v) => setNewIsActive(String(v) === 'yes')}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
              disabled={saving}
            />

            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
              <Button variant="secondary" onClick={() => refresh()} disabled={saving}>
                Refresh
              </Button>
              <Button
                variant="primary"
                onClick={createStatus}
                disabled={saving || !newKey.trim() || !newLabel.trim()}
              >
                Create status
              </Button>
            </div>
          </div>

          <Table columns={columns as any} data={rows as any} loading={loading} />
        </div>
      </Card>
    </Page>
  );
}

export default ProjectStatusesSetup;


