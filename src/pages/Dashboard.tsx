'use client';

import React, { useState, useCallback } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjects } from '../hooks/useProjects';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { Plus } from 'lucide-react';

function isAdminUser(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('hit_token') || '';
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    const roles: string[] = Array.isArray(payload.roles)
      ? payload.roles.map((r: any) => String(r))
      : payload.role
        ? [String(payload.role)]
        : [];
    return roles.includes('admin');
  } catch {
    return false;
  }
}

export function Dashboard() {
  const { Page, Card, Button, DataTable } = useUi();
  const [page, setPage] = useState(1);
  const pageSize = 25;
  
  // View state - managed by DataTable's view system when enableViews is true
  const [excludeArchived, setExcludeArchived] = useState(true); // Default: hide archived
  const [sortConfig, setSortConfig] = useState<{ sortBy: 'name' | 'lastUpdatedOnTimestamp'; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'lastUpdatedOnTimestamp',
    sortOrder: 'desc',
  });

  // Handle view filter changes from DataTable
  const handleViewFiltersChange = useCallback((filters: Array<{ field: string; operator: string; value: any }>) => {
    // Check for status filter
    const statusFilter = filters.find((f) => f.field === 'status');
    if (statusFilter) {
      if (statusFilter.operator === 'notEquals' && statusFilter.value === 'archived') {
        setExcludeArchived(true);
      } else {
        setExcludeArchived(false);
      }
    } else {
      // No status filter means show all
      setExcludeArchived(false);
    }
  }, []);

  const { data, loading, error, refresh } = useProjects({
    page,
    pageSize,
    excludeArchived,
    sortBy: sortConfig.sortBy,
    sortOrder: sortConfig.sortOrder,
  });

  const handleRowClick = (row: Record<string, unknown>) => {
    const id = String((row as any)?.id || '');
    if (!id) return;
    window.location.href = `/projects/${id}`;
  };

  const handleCreate = () => {
    window.location.href = '/projects/new';
  };

  const handleSetup = () => {
    window.location.href = '/projects/setup/statuses';
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
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
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => (
        <ProjectStatusBadge status={String((row as any)?.status || '')} />
      ),
    },
    {
      key: 'lastUpdatedOnTimestamp',
      label: 'Updated',
      sortable: true,
      render: (_value: unknown, row: Record<string, unknown>) => {
        const ts = (row as any)?.lastUpdatedOnTimestamp;
        const d = ts ? new Date(ts) : null;
        return d ? d.toLocaleDateString() : '';
      },
    },
  ];

  const projects = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Page
      title="Projects"
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          {isAdminUser() ? (
            <Button variant="secondary" onClick={handleSetup}>
              Setup
            </Button>
          ) : null}
          <Button variant="primary" onClick={handleCreate}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Create Project
          </Button>
        </div>
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
            emptyMessage="No projects yet. Create your first project to track milestones, linked systems, and activity."
            pageSize={pageSize}
            total={pagination?.total}
            page={page}
            onPageChange={setPage}
            manualPagination={true}
            onRefresh={refresh}
            refreshing={loading}
            initialSorting={[{ id: 'lastUpdatedOnTimestamp', desc: true }]}
            tableId="projects"
            enableViews={true}
            onViewFiltersChange={handleViewFiltersChange}
          />
        )}
      </Card>
    </Page>
  );
}

export default Dashboard;
