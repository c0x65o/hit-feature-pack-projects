'use client';

import React, { useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectActivityTypes } from '../hooks/useProjectActivityTypes';
import { Plus } from 'lucide-react';

export function ProjectActivityTypesSetup() {
  const { Page, Card, Button, DataTable } = useUi();
  const { activityTypes, loading, error, refresh } = useProjectActivityTypes();

  const rows = useMemo(
    () =>
      [...activityTypes].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      }),
    [activityTypes]
  );

  const handleRowClick = (row: Record<string, unknown>) => {
    const id = String((row as any)?.id || '');
    if (!id) return;
    window.location.href = `/projects/setup/activity-types/${id}`;
  };

  const handleCreate = () => {
    window.location.href = '/projects/setup/activity-types/new';
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
        key: 'key',
        label: 'Key',
        sortable: true,
        width: '150px',
        render: (_value: unknown, row: Record<string, unknown>) => {
          const r = row as any;
          return (
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)' }}>
              {r.key}
            </span>
          );
        },
      },
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        hideable: false,
        render: (_value: unknown, row: Record<string, unknown>) => {
          const r = row as any;
          return (
            <a
              href={`/projects/setup/activity-types/${r.id}`}
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
              {r.name}
            </a>
          );
        },
      },
      {
        key: 'category',
        label: 'Category',
        sortable: true,
        width: '120px',
        render: (_value: unknown, row: Record<string, unknown>) => {
          const r = row as any;
          return r.category || '-';
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
        key: 'icon',
        label: 'Icon',
        sortable: true,
        width: '100px',
        render: (_value: unknown, row: Record<string, unknown>) => {
          const r = row as any;
          return r.icon || '-';
        },
      },
      {
        key: 'isSystem',
        label: 'System',
        sortable: true,
        width: '80px',
        render: (_value: unknown, row: Record<string, unknown>) =>
          Boolean((row as any).isSystem) ? 'Yes' : 'No',
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
      title="Activity Types"
      actions={
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Create Activity Type
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
            emptyMessage="No activity types yet. Create your first activity type."
            onRefresh={refresh}
            refreshing={loading}
            initialSorting={[{ id: 'sortOrder', desc: false }]}
            tableId="project-activity-types"
            enableViews={true}
          />
        )}
      </Card>
    </Page>
  );
}

export default ProjectActivityTypesSetup;

