'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectActivityTypes } from '../hooks/useProjectActivityTypes';
import { Plus } from 'lucide-react';
export function ProjectActivityTypesSetup() {
    const { Page, Card, Button, DataTable } = useUi();
    const { activityTypes, loading, error, refresh } = useProjectActivityTypes();
    const rows = useMemo(() => [...activityTypes].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder)
            return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
    }), [activityTypes]);
    const handleRowClick = (row) => {
        const id = String(row?.id || '');
        if (!id)
            return;
        window.location.href = `/projects/setup/activity-types/${id}`;
    };
    const handleCreate = () => {
        window.location.href = '/projects/setup/activity-types/new';
    };
    const columns = useMemo(() => [
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
            render: (_value, row) => {
                const r = row;
                return (_jsx("span", { style: { fontFamily: 'monospace', fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)' }, children: r.key }));
            },
        },
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            hideable: false,
            render: (_value, row) => {
                const r = row;
                return (_jsx("a", { href: `/projects/setup/activity-types/${r.id}`, style: {
                        color: 'var(--hit-primary, #3b82f6)',
                        textDecoration: 'none',
                        fontWeight: '500',
                    }, onClick: (e) => {
                        e.preventDefault();
                        handleRowClick(row);
                    }, children: r.name }));
            },
        },
        {
            key: 'category',
            label: 'Category',
            sortable: true,
            width: '120px',
            render: (_value, row) => {
                const r = row;
                return r.category || '-';
            },
        },
        {
            key: 'color',
            label: 'Color',
            sortable: false,
            width: '140px',
            render: (_value, row) => {
                const r = row;
                const color = r.color || '#64748b';
                return (_jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("div", { style: {
                                width: '20px',
                                height: '20px',
                                backgroundColor: color,
                                border: '1px solid var(--hit-border-default, #cbd5e1)',
                                borderRadius: '4px',
                                flexShrink: 0,
                            } }), _jsx("span", { style: { fontSize: '12px', fontFamily: 'monospace' }, children: color })] }));
            },
        },
        {
            key: 'icon',
            label: 'Icon',
            sortable: true,
            width: '100px',
            render: (_value, row) => {
                const r = row;
                return r.icon || '-';
            },
        },
        {
            key: 'isSystem',
            label: 'System',
            sortable: true,
            width: '80px',
            render: (_value, row) => Boolean(row.isSystem) ? 'Yes' : 'No',
        },
        {
            key: 'isActive',
            label: 'Active',
            sortable: true,
            width: '80px',
            render: (_value, row) => Boolean(row.isActive) ? 'Yes' : 'No',
        },
    ], []);
    return (_jsx(Page, { title: "Activity Types", actions: _jsxs(Button, { variant: "primary", onClick: handleCreate, children: [_jsx(Plus, { size: 16, style: { marginRight: '8px' } }), "Create Activity Type"] }), children: _jsx(Card, { children: error ? (_jsx("div", { style: { padding: '24px', textAlign: 'center', color: 'var(--hit-error, #ef4444)' }, children: error.message })) : (_jsx(DataTable, { columns: columns, data: rows, loading: loading, onRowClick: handleRowClick, emptyMessage: "No activity types yet. Create your first activity type.", onRefresh: refresh, refreshing: loading, initialSorting: [{ id: 'sortOrder', desc: false }], tableId: "project-activity-types", enableViews: true })) }) }));
}
export default ProjectActivityTypesSetup;
