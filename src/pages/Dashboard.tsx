'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { useServerDataTableState } from '@hit/ui-kit/hooks/useServerDataTableState';
import { useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
import { ProjectStatusesProvider } from '../hooks/ProjectStatusesContext';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { Plus } from 'lucide-react';

function DashboardContent() {
  const { Page, Card, Button, DataTable } = useUi();
  
  // Load available statuses for the status filter dropdown (uses shared context)
  const { activeStatuses } = useProjectStatuses();
  
  const serverTable = useServerDataTableState({
    tableId: 'projects',
    pageSize: 25,
    initialSort: { sortBy: 'lastUpdatedOnTimestamp', sortOrder: 'desc' },
    sortWhitelist: [
      'name',
      'statusId',
      'createdOnTimestamp',
      'lastUpdatedOnTimestamp',
      // Metric-backed sorting (dynamic columns)
      'revenue_30d_usd',
      'revenue_all_time_usd',
    ],
  });

  const { data, loading, error, refresh } = useProjects({
    page: serverTable.query.page,
    pageSize: serverTable.query.pageSize,
    search: serverTable.query.search,
    sortBy: serverTable.query.sortBy,
    sortOrder: serverTable.query.sortOrder,
    filters: serverTable.query.filters as any,
    filterMode: serverTable.query.filterMode,
  });
  
  // Build status options from loaded statuses
  const statusOptions = useMemo(() => {
    return activeStatuses.map((s) => ({ value: s.id, label: s.label }));
  }, [activeStatuses]);

  const handleRowClick = (row: Record<string, unknown>) => {
    const id = String((row as any)?.id || '');
    if (!id) return;
    window.location.href = `/projects/${id}`;
  };

  const handleCreate = () => {
    window.location.href = '/projects/new';
  };

  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterType: 'string' as const,
      hideable: false, // Name column should always be visible
      render: (_value: unknown, row: Record<string, unknown>) => {
        const project = row as any;
        return (
          <a
            href={`/projects/${String(project.id)}`}
            style={{
              color: 'var(--hit-primary, #3b82f6)',
              textDecoration: 'none',
              fontWeight: '500',
            }}
            onClick={(e) => {
              e.preventDefault();
              handleRowClick(project as any);
            }}
          >
            {String(project.name || '')}
          </a>
        );
      },
    },
    {
      key: 'statusId',
      label: 'Status',
      sortable: true,
      filterType: 'select' as const,
      filterOptions: statusOptions,
      render: (_value: unknown, row: Record<string, unknown>) => (
        <ProjectStatusBadge statusId={String((row as any)?.statusId || '')} />
      ),
    },
    {
      key: 'lastUpdatedOnTimestamp',
      label: 'Updated',
      sortable: true,
      filterType: 'date' as const,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const ts = (row as any)?.lastUpdatedOnTimestamp;
        const d = ts ? new Date(ts) : null;
        return d ? d.toLocaleDateString() : '';
      },
    },
  ], [statusOptions, handleRowClick]);

  const projects = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Page
      title="Projects"
      actions={
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Create Project
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
            columns={columns}
            data={projects}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage="No projects yet. Create your first project to track activities, linked systems, and more."
            total={pagination?.total}
            {...serverTable.dataTable}
            onRefresh={refresh}
            refreshing={loading}
            initialSorting={[{ id: 'lastUpdatedOnTimestamp', desc: true }]}
            tableId="projects"
            enableViews={true}
            showGlobalFilters
            searchDebounceMs={400}
          />
        )}
      </Card>
    </Page>
  );
}

/**
 * Dashboard wrapped with ProjectStatusesProvider to share statuses data
 * across all child components (avoiding N+1 API calls)
 */
export function Dashboard() {
  return (
    <ProjectStatusesProvider>
      <DashboardContent />
    </ProjectStatusesProvider>
  );
}

export default Dashboard;
