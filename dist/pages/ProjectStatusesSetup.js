'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
import { Plus } from 'lucide-react';
export function ProjectStatusesSetup() {
    const { Page, Card, Button, DataTable } = useUi();
    const { statuses, loading, error, refresh } = useProjectStatuses();
    const rows = useMemo(() => [...statuses].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder)
            return a.sortOrder - b.sortOrder;
        return a.label.localeCompare(b.label);
    }), [statuses]);
    const handleRowClick = (row) => {
        const id = String(row?.id || '');
        if (!id)
            return;
        window.location.href = `/projects/setup/statuses/${id}/edit`;
    };
    const handleCreate = () => {
        window.location.href = '/projects/setup/statuses/new';
    };
    const columns = useMemo(() => [
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
            render: (_value, row) => {
                const r = row;
                return (_jsx("a", { href: `/projects/setup/statuses/${r.id}/edit`, style: {
                        color: 'var(--hit-primary, #3b82f6)',
                        textDecoration: 'none',
                        fontWeight: '500',
                    }, onClick: (e) => {
                        e.preventDefault();
                        handleRowClick(row);
                    }, children: r.label }));
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
            key: 'isActive',
            label: 'Active',
            sortable: true,
            width: '80px',
            render: (_value, row) => Boolean(row.isActive) ? 'Yes' : 'No',
        },
    ], []);
    return (_jsx(Page, { title: "Project Statuses", actions: _jsxs(Button, { variant: "primary", onClick: handleCreate, children: [_jsx(Plus, { size: 16, style: { marginRight: '8px' } }), "Create Status"] }), children: _jsx(Card, { children: error ? (_jsx("div", { style: { padding: '24px', textAlign: 'center', color: 'var(--hit-error, #ef4444)' }, children: error.message })) : (_jsx(DataTable, { columns: columns, data: rows, loading: loading, onRowClick: handleRowClick, emptyMessage: "No statuses yet. Create your first status.", onRefresh: refresh, refreshing: loading, initialSorting: [{ id: 'sortOrder', desc: false }] })) }) }));
}
export default ProjectStatusesSetup;
