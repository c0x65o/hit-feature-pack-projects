'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
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
        filters: serverTable.query.filters,
        filterMode: serverTable.query.filterMode,
    });
    // Build status options from loaded statuses
    const statusOptions = useMemo(() => {
        return activeStatuses.map((s) => ({ value: s.id, label: s.label }));
    }, [activeStatuses]);
    const handleRowClick = (row) => {
        const id = String(row?.id || '');
        if (!id)
            return;
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
            filterType: 'string',
            hideable: false, // Name column should always be visible
            render: (_value, row) => {
                const project = row;
                return (_jsx("a", { href: `/projects/${String(project.id)}`, style: {
                        color: 'var(--hit-primary, #3b82f6)',
                        textDecoration: 'none',
                        fontWeight: '500',
                    }, onClick: (e) => {
                        e.preventDefault();
                        handleRowClick(project);
                    }, children: String(project.name || '') }));
            },
        },
        {
            key: 'statusId',
            label: 'Status',
            sortable: true,
            filterType: 'select',
            filterOptions: statusOptions,
            render: (_value, row) => (_jsx(ProjectStatusBadge, { statusId: String(row?.statusId || '') })),
        },
        {
            key: 'lastUpdatedOnTimestamp',
            label: 'Updated',
            sortable: true,
            filterType: 'date',
            render: (_value, row) => {
                const ts = row?.lastUpdatedOnTimestamp;
                const d = ts ? new Date(ts) : null;
                return d ? d.toLocaleDateString() : '';
            },
        },
    ], [statusOptions, handleRowClick]);
    const projects = data?.data || [];
    const pagination = data?.pagination;
    return (_jsx(Page, { title: "Projects", actions: _jsxs(Button, { variant: "primary", onClick: handleCreate, children: [_jsx(Plus, { size: 16, style: { marginRight: '8px' } }), "Create Project"] }), children: _jsx(Card, { children: error ? (_jsx("div", { style: { padding: '24px', textAlign: 'center', color: 'var(--hit-error, #ef4444)' }, children: error.message })) : (_jsx(DataTable, { columns: columns, data: projects, loading: loading, onRowClick: handleRowClick, emptyMessage: "No projects yet. Create your first project to track activities, linked systems, and more.", total: pagination?.total, ...serverTable.dataTable, onRefresh: refresh, refreshing: loading, initialSorting: [{ id: 'lastUpdatedOnTimestamp', desc: true }], tableId: "projects", enableViews: true, showGlobalFilters: true, searchDebounceMs: 400 })) }) }));
}
/**
 * Dashboard wrapped with ProjectStatusesProvider to share statuses data
 * across all child components (avoiding N+1 API calls)
 */
export function Dashboard() {
    return (_jsx(ProjectStatusesProvider, { children: _jsx(DashboardContent, {}) }));
}
export default Dashboard;
