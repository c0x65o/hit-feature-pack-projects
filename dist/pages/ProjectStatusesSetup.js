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
    const { Page, Card, Button, Input, Select, Table } = useUi();
    const { statuses, loading, error, refresh } = useProjectStatuses();
    const [newKey, setNewKey] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [newColor, setNewColor] = useState('#64748b');
    const [newSortOrder, setNewSortOrder] = useState('0');
    const [newIsDefault, setNewIsDefault] = useState(false);
    const [newIsActive, setNewIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const rows = useMemo(() => statuses.map((s) => ({
        key: s.key,
        label: s.label,
        color: s.color ?? null,
        sortOrder: s.sortOrder,
        isDefault: s.isDefault,
        isActive: s.isActive,
    })), [statuses]);
    const createStatus = async () => {
        setSaveError(null);
        setSaving(true);
        try {
            await fetchJson('/api/projects/statuses', {
                method: 'POST',
                body: JSON.stringify({
                    key: newKey,
                    label: newLabel,
                    color: newColor,
                    sortOrder: Number(newSortOrder || 0),
                    isDefault: newIsDefault,
                    isActive: newIsActive,
                }),
            });
            setNewKey('');
            setNewLabel('');
            setNewColor('#64748b');
            setNewSortOrder('0');
            setNewIsDefault(false);
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
    const updateStatus = async (key, patch) => {
        setSaveError(null);
        setSaving(true);
        try {
            await fetchJson(`/api/projects/statuses/${encodeURIComponent(key)}`, {
                method: 'PUT',
                body: JSON.stringify(patch),
            });
            await refresh();
        }
        catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Failed to update status');
        }
        finally {
            setSaving(false);
        }
    };
    const deleteStatus = async (key) => {
        if (!confirm(`Delete status "${key}"?`))
            return;
        setSaveError(null);
        setSaving(true);
        try {
            await fetchJson(`/api/projects/statuses/${encodeURIComponent(key)}`, { method: 'DELETE' });
            await refresh();
        }
        catch (e) {
            setSaveError(e instanceof Error ? e.message : 'Failed to delete status');
        }
        finally {
            setSaving(false);
        }
    };
    const columns = [
        {
            key: 'key',
            label: 'Key',
            render: (_v, row) => _jsx("code", { children: String(row.key) }),
        },
        {
            key: 'label',
            label: 'Label',
            render: (_v, row) => String(row.label),
        },
        {
            key: 'isActive',
            label: 'Active',
            render: (_v, row) => (Boolean(row.isActive) ? 'Yes' : 'No'),
        },
        {
            key: 'isDefault',
            label: 'Default',
            render: (_v, row) => (Boolean(row.isDefault) ? 'Yes' : 'No'),
        },
        {
            key: 'actions',
            label: '',
            render: (_v, row) => {
                const r = row;
                return (_jsxs("div", { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' }, children: [_jsx(Button, { variant: "secondary", size: "sm", disabled: saving, onClick: () => updateStatus(r.key, { isDefault: true }), children: "Set default" }), _jsx(Button, { variant: "secondary", size: "sm", disabled: saving, onClick: () => updateStatus(r.key, { isActive: !r.isActive }), children: r.isActive ? 'Deactivate' : 'Activate' }), _jsx(Button, { variant: "ghost", size: "sm", disabled: saving || r.isDefault, onClick: () => deleteStatus(r.key), children: "Delete" })] }));
            },
        },
    ];
    return (_jsx(Page, { title: "Project Statuses (Setup)", children: _jsxs(Card, { title: "Status Catalog", children: [_jsx("div", { style: { fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '12px' }, children: "Seeded by migrations; editable here (admin)." }), error ? (_jsx("div", { style: { padding: '12px', color: 'var(--hit-error, #ef4444)' }, children: error.message })) : null, saveError ? (_jsx("div", { style: { padding: '12px', color: 'var(--hit-error, #ef4444)' }, children: saveError })) : null, _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '12px' }, children: [_jsx(Input, { label: "Key", value: newKey, onChange: setNewKey, placeholder: "e.g. active", disabled: saving }), _jsx(Input, { label: "Label", value: newLabel, onChange: setNewLabel, placeholder: "e.g. Active", disabled: saving }), _jsx(Input, { label: "Color", value: newColor, onChange: setNewColor, placeholder: "#22c55e", disabled: saving }), _jsx(Input, { label: "Sort", value: newSortOrder, onChange: setNewSortOrder, placeholder: "0", disabled: saving })] }), _jsxs("div", { style: { display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }, children: [_jsx(Select, { label: "Default?", value: newIsDefault ? 'yes' : 'no', onChange: (v) => setNewIsDefault(String(v) === 'yes'), options: [
                                        { value: 'no', label: 'No' },
                                        { value: 'yes', label: 'Yes' },
                                    ], disabled: saving }), _jsx(Select, { label: "Active?", value: newIsActive ? 'yes' : 'no', onChange: (v) => setNewIsActive(String(v) === 'yes'), options: [
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' },
                                    ], disabled: saving }), _jsxs("div", { style: { display: 'flex', gap: '8px', marginLeft: 'auto' }, children: [_jsx(Button, { variant: "secondary", onClick: () => refresh(), disabled: saving, children: "Refresh" }), _jsx(Button, { variant: "primary", onClick: createStatus, disabled: saving || !newKey.trim() || !newLabel.trim(), children: "Create status" })] })] }), _jsx(Table, { columns: columns, data: rows, loading: loading })] })] }) }));
}
export default ProjectStatusesSetup;
