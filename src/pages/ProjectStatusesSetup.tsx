'use client';

import React, { useMemo, useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

type StatusRow = {
  id: string;
  label: string;
  color: string | null;
  sortOrder: number;
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
  const { Page, Card, Button, Input, Select, DataTable } = useUi();
  const { statuses, loading, error, refresh } = useProjectStatuses();

  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#64748b');
  const [newSortOrder, setNewSortOrder] = useState('0');
  const [newIsActive, setNewIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const rows: StatusRow[] = useMemo(
    () =>
      [...statuses]
        .map((s) => ({
          id: s.id,
          label: s.label,
          color: s.color ?? null,
          sortOrder: s.sortOrder,
          isActive: s.isActive,
        }))
        .sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
          return a.label.localeCompare(b.label);
        }),
    [statuses]
  );

  const createStatus = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      await fetchJson('/api/projects/statuses', {
        method: 'POST',
        body: JSON.stringify({
          label: newLabel,
          color: newColor,
          sortOrder: Number(newSortOrder || 0),
          isActive: newIsActive,
        }),
      });
      setNewLabel('');
      setNewColor('#64748b');
      setNewSortOrder('0');
      setNewIsActive(true);
      await refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create status');
    } finally {
      setSaving(false);
    }
  };

  const deleteStatus = async (id: string, label: string) => {
    if (!confirm(`Delete status "${label}"?`)) return;
    setSaveError(null);
    setSaving(true);
    try {
      await fetchJson(`/api/projects/statuses/${encodeURIComponent(id)}`, { method: 'DELETE' });
      await refresh();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to delete status');
    } finally {
      setSaving(false);
    }
  };

  const handleRowClick = (row: Record<string, unknown>) => {
    const id = String((row as any)?.id || '');
    if (!id) return;
    window.location.href = `/projects/setup/statuses/${id}/edit`;
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    window.location.href = `/projects/setup/statuses/${id}/edit`;
  };

  const columns = [
    {
      key: 'sortOrder',
      label: 'Sort',
      sortable: true,
      width: '80px',
      render: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as any as StatusRow;
        return <span>{r.sortOrder}</span>;
      },
    },
    {
      key: 'color',
      label: 'Color',
      sortable: false,
      width: '120px',
      render: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as any as StatusRow;
        const color = r.color || '#64748b';
        return (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: color,
                border: '1px solid var(--hit-border-default, #cbd5e1)',
                borderRadius: '4px',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{color}</span>
          </div>
        );
      },
    },
    {
      key: 'label',
      label: 'Label',
      sortable: true,
      render: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as any as StatusRow;
        return (
          <a
            href={`/projects/setup/statuses/${r.id}/edit`}
            style={{
              color: 'var(--hit-primary, #3b82f6)',
              textDecoration: 'none',
              fontWeight: '500',
            }}
            onClick={(e) => {
              e.preventDefault();
              handleRowClick(row);
            }}
          >
            {r.label}
          </a>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Active',
      sortable: true,
      render: (_v: unknown, row: Record<string, unknown>) => (Boolean((row as any).isActive) ? 'Yes' : 'No'),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      hideable: false,
      align: 'right' as const,
      render: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as any as StatusRow;
        return (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={(e) => handleEdit(e, r.id)}
            >
              Edit
            </Button>
            <Button variant="ghost" size="sm" disabled={saving} onClick={() => deleteStatus(r.id, r.label)}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
            <Input label="Label" value={newLabel} onChange={setNewLabel} placeholder="e.g. Active" disabled={saving} maxLength={50} />
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                fontWeight: 500, 
                color: 'var(--hit-muted-foreground, #64748b)',
                marginBottom: '6px',
              }}>
                Color
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  disabled={saving}
                  style={{
                    width: '60px',
                    height: '40px',
                    padding: '2px',
                    backgroundColor: 'var(--hit-input-bg, #ffffff)',
                    border: '1px solid var(--hit-border-default, #cbd5e1)',
                    borderRadius: '6px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.5 : 1,
                  }}
                />
                <Input 
                  value={newColor} 
                  onChange={setNewColor} 
                  placeholder="#64748b" 
                  disabled={saving}
                  className="flex-1"
                />
              </div>
            </div>
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
                disabled={saving || !newLabel.trim()}
              >
                Create status
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns as any}
            data={rows as any}
            loading={loading}
            onRowClick={handleRowClick}
            searchable={false}
            exportable={false}
            showColumnVisibility={false}
            pageSize={100}
            initialSorting={[{ id: 'sortOrder', desc: false }]}
          />
        </div>
      </Card>
    </Page>
  );
}

export default ProjectStatusesSetup;


