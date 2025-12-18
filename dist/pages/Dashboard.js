'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjects } from '../hooks/useProjects';
import { ProjectStatusBadge } from '../components/ProjectStatusBadge';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
import { Plus } from 'lucide-react';
function isAdminUser() {
    if (typeof window === 'undefined')
        return false;
    const token = localStorage.getItem('hit_token') || '';
    if (!token)
        return false;
    try {
        const parts = token.split('.');
        if (parts.length !== 3)
            return false;
        const payload = JSON.parse(atob(parts[1]));
        const roles = Array.isArray(payload.roles)
            ? payload.roles.map((r) => String(r))
            : payload.role
                ? [String(payload.role)]
                : [];
        return roles.includes('admin');
    }
    catch {
        return false;
    }
}
export function Dashboard() {
    const { Page, Card, Button, Input, Select, Table, EmptyState } = useUi();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('lastUpdatedOnTimestamp');
    const [sortOrder, setSortOrder] = useState('desc');
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
    const handleRowClick = (row) => {
        const id = String(row?.id || '');
        if (!id)
            return;
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
            key: 'status',
            label: 'Status',
            render: (_value, row) => (_jsx(ProjectStatusBadge, { status: String(row?.status || '') })),
        },
        {
            key: 'lastUpdatedOnTimestamp',
            label: 'Updated',
            render: (_value, row) => {
                const ts = row?.lastUpdatedOnTimestamp;
                const d = ts ? new Date(ts) : null;
                return d ? d.toLocaleDateString() : '';
            },
        },
    ];
    const projects = data?.data || [];
    const pagination = data?.pagination;
    return (_jsx(Page, { title: "Projects", actions: _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [isAdminUser() ? (_jsx(Button, { variant: "secondary", onClick: handleSetup, children: "Setup" })) : null, _jsxs(Button, { variant: "primary", onClick: handleCreate, children: [_jsx(Plus, { size: 16, style: { marginRight: '8px' } }), "Create Project"] })] }), children: _jsx(Card, { children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }, children: [_jsx("div", { style: { flex: '1 1 300px', minWidth: '200px' }, children: _jsx(Input, { placeholder: "Search by name, slug, description", value: search, onChange: setSearch, style: { position: 'relative' } }) }), _jsx("div", { style: { minWidth: '150px' }, children: _jsx(Select, { placeholder: "All Statuses", value: statusFilter, onChange: setStatusFilter, options: [
                                        { value: '', label: 'All Statuses' },
                                        ...activeStatuses.map((s) => ({ value: s.key, label: s.label })),
                                    ] }) }), _jsx("div", { style: { minWidth: '180px' }, children: _jsx(Select, { placeholder: "Sort by", value: `${sortBy}-${sortOrder}`, onChange: (value) => {
                                        const [newSortBy, newSortOrder] = value.split('-');
                                        setSortBy(newSortBy);
                                        setSortOrder(newSortOrder);
                                    }, options: [
                                        { value: 'lastUpdatedOnTimestamp-desc', label: 'Recently updated' },
                                        { value: 'lastUpdatedOnTimestamp-asc', label: 'Oldest updated' },
                                        { value: 'name-asc', label: 'Name (A-Z)' },
                                        { value: 'name-desc', label: 'Name (Z-A)' },
                                    ] }) })] }), error ? (_jsx("div", { style: { padding: '24px', textAlign: 'center', color: 'var(--hit-error, #ef4444)' }, children: error.message })) : projects.length === 0 && !loading ? (_jsx(EmptyState, { title: "No projects yet", description: "Create your first project to track milestones, linked systems, and activity.", action: _jsx(Button, { variant: "primary", onClick: handleCreate, children: "Create Project" }) })) : (_jsxs(_Fragment, { children: [_jsx(Table, { columns: columns, data: projects, loading: loading, onRowClick: (row) => handleRowClick(row) }), pagination && pagination.totalPages > 1 && (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }, children: [_jsxs("div", { style: { fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)' }, children: ["Showing ", ((pagination.page - 1) * pagination.pageSize) + 1, "-", Math.min(pagination.page * pagination.pageSize, pagination.total), " of ", pagination.total] }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Button, { variant: "secondary", size: "sm", onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: pagination.page === 1 || loading, children: "Previous" }), _jsx(Button, { variant: "secondary", size: "sm", onClick: () => setPage((p) => Math.min(pagination.totalPages, p + 1)), disabled: pagination.page === pagination.totalPages || loading, children: "Next" })] })] }))] }))] }) }) }));
}
export default Dashboard;
