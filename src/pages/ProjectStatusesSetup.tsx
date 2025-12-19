'use client';

import React, { useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
import { Plus } from 'lucide-react';

export function ProjectStatusesSetup() {
  const { Page, Card, Button, DataTable } = useUi();
  const { statuses, loading, error, refresh } = useProjectStatuses();

  const rows = useMemo(
    () =>
      [...statuses].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.label.localeCompare(b.label);
      }),
    [statuses]
  );

  const handleRowClick = (row: Record<string, unknown>) => {
    const id = String((row as any)?.id || '');
    if (!id) return;
    window.location.href = `/projects/setup/statuses/${id}/edit`;
  };

  const handleCreate = () => {
    window.location.href = '/projects/setup/statuses/new';
  };

  const columns = useMemo(
    () => [
      {
        key: 'sortOrder',
        label: 'Sort',
        sortable: true,
        width: '80px',
      },
      {
        key: 'label',
        label: 'Label',
        sortable: true,
        hideable: false,
        render: (_value: unknown, row: Record<string, unknown>) => {
          const r = row as any;
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
        key: 'color',
        label: 'Color',
        sortable: false,
        width: '140px',
        render: (_value: unknown, row: Record<string, unknown>) => {
          const r = row as any;
          const color = r.color || '#64748b';
          return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div
                style={{
                  width: '20px',
                  height: '20px',
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
        key: 'isActive',
        label: 'Active',
        sortable: true,
        width: '80px',
        render: (_value: unknown, row: Record<string, unknown>) =>
          Boolean((row as any).isActive) ? 'Yes' : 'No',
      },
    ],
    []
  );

  return (
    <Page
      title="Project Statuses"
      actions={
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Create Status
        </Button>
      }
    >
      <Card>
        {error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--hit-error, #ef4444)' }}>
            {error.message}
          </div>
        ) : (
          <DataTable
            columns={columns as any}
            data={rows as any}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No statuses yet. Create your first status."
            onRefresh={refresh}
            refreshing={loading}
            initialSorting={[{ id: 'sortOrder', desc: false }]}
          />
        )}
      </Card>
    </Page>
  );
}

export default ProjectStatusesSetup;
