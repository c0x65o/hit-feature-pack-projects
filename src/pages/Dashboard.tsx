'use client';

import React, { useState, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjects } from '../hooks/useProjects';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
import { MoreVertical, Plus, Search } from 'lucide-react';

export function Dashboard() {
  const { Page, Card, Button, Input, Select, Table, EmptyState } = useUi();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'lastUpdatedOnTimestamp'>('lastUpdatedOnTimestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { data, loading, error } = useProjects({
    page,
    pageSize,
    search,
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
  });
  const { activeStatuses } = useProjectStatuses();

  const handleRowClick = (row: Record<string, unknown>) => {
    const id = String((row as any)?.id || '');
    if (!id) return;
    window.location.href = `/projects/${id}`;
  };

  const handleCreate = () => {
    window.location.href = '/projects/new';
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
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
      render: (_value: unknown, row: Record<string, unknown>) => (
        <ProjectStatusBadge status={String((row as any)?.status || '')} />
      ),
    },
    {
      key: 'lastUpdatedOnTimestamp',
      label: 'Updated',
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
        <Button variant="primary" onClick={handleCreate}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Create Project
        </Button>
      }
    >
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Controls Row */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
              <Input
                placeholder="Search by name, slug, description"
                value={search}
                onChange={setSearch}
                style={{ position: 'relative' }}
              />
            </div>
            <div style={{ minWidth: '150px' }}>
              <Select
                placeholder="All Statuses"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: '', label: 'All Statuses' },
                  ...activeStatuses.map((s) => ({ value: s.key, label: s.label })),
                ]}
              />
            </div>
            <div style={{ minWidth: '180px' }}>
              <Select
                placeholder="Sort by"
                value={`${sortBy}-${sortOrder}`}
                onChange={(value) => {
                  const [newSortBy, newSortOrder] = value.split('-');
                  setSortBy(newSortBy as typeof sortBy);
                  setSortOrder(newSortOrder as typeof sortOrder);
                }}
                options={[
                  { value: 'lastUpdatedOnTimestamp-desc', label: 'Recently updated' },
                  { value: 'lastUpdatedOnTimestamp-asc', label: 'Oldest updated' },
                  { value: 'name-asc', label: 'Name (A-Z)' },
                  { value: 'name-desc', label: 'Name (Z-A)' },
                ]}
              />
            </div>
          </div>

          {/* Results Table */}
          {error ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--hit-error, #ef4444)' }}>
              {error.message}
            </div>
          ) : projects.length === 0 && !loading ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to track milestones, linked systems, and activity."
              action={
                <Button variant="primary" onClick={handleCreate}>
                  Create Project
                </Button>
              }
            />
          ) : (
            <>
              <Table
                columns={columns as any}
                data={projects as any}
                loading={loading}
                onRowClick={(row: Record<string, unknown>) => handleRowClick(row)}
              />
              {pagination && pagination.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <div style={{ fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)' }}>
                    Showing {((pagination.page - 1) * pagination.pageSize) + 1}-
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page === 1 || loading}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page === pagination.totalPages || loading}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </Page>
  );
}

export default Dashboard;
