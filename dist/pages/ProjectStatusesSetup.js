'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
async function fetchJson(url, options) {
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
    const [saveError, setSaveError] = useState(null);
    const rows = useMemo(() => [...statuses]
        .map((s) => ({
        id: s.id,
        label: s.label,
        color: s.color ?? null,
        sortOrder: s.sortOrder,
        isActive: s.isActive,
    }))
        .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder)
            return a.sortOrder - b.sortOrder;
        return a.label.localeCompare(b.label);
    }), [statuses]);
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
        }
        catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Failed to create status');
        }
        finally {
            setSaving(false);
        }
    };
    const deleteStatus = async (id, label) => {
        if (!confirm(`Delete status "${label}"?`))
            return;
        setSaveError(null);
        setSaving(true);
        try {
            await fetchJson(`/api/projects/statuses/${encodeURIComponent(id)}`, { method: 'DELETE' });
            await refresh();
        }
        catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Failed to delete status');
        }
        finally {
            setSaving(false);
        }
    };
    const handleRowClick = (row) => {
        const id = String(row?.id || '');
        if (!id)
            return;
        window.location.href = `/projects/setup/statuses/${id}/edit`;
    };
    const handleEdit = (e, id) => {
        e.stopPropagation();
        window.location.href = `/projects/setup/statuses/${id}/edit`;
    };
    const columns = [
        {
            key: 'sortOrder',
            label: 'Sort',
            sortable: true,
            width: '80px',
            render: (_v, row) => {
                const r = row;
                return _jsx("span", { children: r.sortOrder });
            },
        },
        {
            key: 'color',
            label: 'Color',
            sortable: false,
            width: '120px',
            render: (_v, row) => {
                const r = row;
                const color = r.color || '#64748b';
                return (_jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("div", { style: {
                                width: '24px',
                                height: '24px',
                                backgroundColor: color,
                                border: '1px solid var(--hit-border-default, #cbd5e1)',
                                borderRadius: '4px',
                                flexShrink: 0,
                            } }), _jsx("span", { style: { fontSize: '12px', fontFamily: 'monospace' }, children: color })] }));
            },
        },
        {
            key: 'label',
            label: 'Label',
            sortable: true,
            render: (_v, row) => {
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
            key: 'isActive',
            label: 'Active',
            sortable: true,
            render: (_v, row) => (Boolean(row.isActive) ? 'Yes' : 'No'),
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            hideable: false,
            align: 'right',
            render: (_v, row) => {
                const r = row;
                return (_jsxs("div", { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' }, children: [_jsx(Button, { variant: "secondary", size: "sm", disabled: saving, onClick: (e) => handleEdit(e, r.id), children: "Edit" }), _jsx(Button, { variant: "ghost", size: "sm", disabled: saving, onClick: () => deleteStatus(r.id, r.label), children: "Delete" })] }));
            },
        },
    ];
    return (_jsx(Page, { title: "Project Statuses (Setup)", children: _jsxs(Card, { title: "Status Catalog", children: [_jsx("div", { style: { fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '12px' }, children: "Seeded by migrations; editable here (admin)." }), error ? (_jsx("div", { style: { padding: '12px', color: 'var(--hit-error, #ef4444)' }, children: error.message })) : null, saveError ? (_jsx("div", { style: { padding: '12px', color: 'var(--hit-error, #ef4444)' }, children: saveError })) : null, _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', alignItems: 'end' }, children: [_jsx(Input, { label: "Label", value: newLabel, onChange: setNewLabel, placeholder: "e.g. Active", disabled: saving, maxLength: 50 }), _jsxs("div", { children: [_jsx("label", { style: {
                                                display: 'block',
                                                fontSize: '13px',
                                                fontWeight: 500,
                                                color: 'var(--hit-muted-foreground, #64748b)',
                                                marginBottom: '6px',
                                            }, children: "Color" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("input", { type: "color", value: newColor, onChange: (e) => setNewColor(e.target.value), disabled: saving, style: {
                                                        width: '60px',
                                                        height: '40px',
                                                        padding: '2px',
                                                        backgroundColor: 'var(--hit-input-bg, #ffffff)',
                                                        border: '1px solid var(--hit-border-default, #cbd5e1)',
                                                        borderRadius: '6px',
                                                        cursor: saving ? 'not-allowed' : 'pointer',
                                                        opacity: saving ? 0.5 : 1,
                                                    } }), _jsx(Input, { value: newColor, onChange: setNewColor, placeholder: "#64748b", disabled: saving, className: "flex-1" })] })] }), _jsx(Input, { label: "Sort", value: newSortOrder, onChange: setNewSortOrder, placeholder: "0", disabled: saving })] }), _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }, children: [_jsx(Select, { label: "Active?", value: newIsActive ? 'yes' : 'no', onChange: (v) => setNewIsActive(String(v) === 'yes'), options: [
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' },
                                    ], disabled: saving }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginLeft: 'auto' }, children: [_jsx(Button, { variant: "secondary", onClick: () => refresh(), disabled: saving, children: "Refresh" }), _jsx(Button, { variant: "primary", onClick: createStatus, disabled: saving || !newLabel.trim(), children: "Create status" })] })] }), _jsx(DataTable, { columns: columns, data: rows, loading: loading, onRowClick: handleRowClick, searchable: false, exportable: false, showColumnVisibility: false, pageSize: 100, initialSorting: [{ id: 'sortOrder', desc: false }] })] })] }) }));
}
export default ProjectStatusesSetup;
