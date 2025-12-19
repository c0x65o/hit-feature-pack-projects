'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
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
export function EditProjectStatus(props) {
    const { Page, Card, Button, Input, Select } = useUi();
    const statusId = props.id;
    const { statuses, loading: statusesLoading, refresh } = useProjectStatuses();
    const status = statuses.find((s) => s.id === statusId);
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#64748b');
    const [sortOrder, setSortOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (status) {
            setLabel(status.label);
            setColor(status.color || '#64748b');
            setSortOrder(String(status.sortOrder || 0));
            setIsActive(status.isActive);
        }
    }, [status]);
    useEffect(() => {
        if (!statusesLoading && statuses.length > 0 && statusId) {
            refresh();
        }
    }, [statusId, statusesLoading, statuses.length, refresh]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!statusId)
            return;
        setError(null);
        if (!label.trim()) {
            setError('Label is required');
            return;
        }
        setLoading(true);
        try {
            await fetchJson(`/api/projects/statuses/${encodeURIComponent(statusId)}`, {
                method: 'PUT',
                body: JSON.stringify({
                    label: label.trim(),
                    color: color.trim() || null,
                    sortOrder: Number(sortOrder || 0),
                    isActive,
                }),
            });
            window.location.href = '/projects/setup/statuses';
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        window.location.href = '/projects/setup/statuses';
    };
    const navigate = (path) => {
        window.location.href = path;
    };
    const breadcrumbs = status
        ? [
            { label: 'Projects', href: '/projects' },
            { label: 'Setup', href: '/projects/setup/statuses' },
            { label: 'Statuses', href: '/projects/setup/statuses' },
            { label: status.label, href: `/projects/setup/statuses/${statusId}` },
            { label: 'Edit' },
        ]
        : [
            { label: 'Projects', href: '/projects' },
            { label: 'Setup', href: '/projects/setup/statuses' },
            { label: 'Statuses', href: '/projects/setup/statuses' },
            { label: 'Edit Status' },
        ];
    if (statusesLoading) {
        return (_jsx(Page, { title: "Edit Status", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px' }, children: "Loading status..." }) }) }));
    }
    if (!status) {
        return (_jsx(Page, { title: "Edit Status", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsxs(Card, { children: [_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }, children: "Status not found" }), _jsx("div", { style: { textAlign: 'center', marginTop: '16px' }, children: _jsx(Button, { variant: "secondary", onClick: () => (window.location.href = '/projects/setup/statuses'), children: "Back to Statuses" }) })] }) }));
    }
    return (_jsx(Page, { title: "Edit Status", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx("div", { style: {
                            padding: '12px',
                            backgroundColor: 'var(--hit-error-light, rgba(239, 68, 68, 0.1))',
                            border: '1px solid var(--hit-error, #ef4444)',
                            borderRadius: '8px',
                            color: 'var(--hit-error, #ef4444)',
                            fontSize: '14px',
                        }, children: error })), _jsx(Input, { label: "Label", value: label, onChange: setLabel, placeholder: "e.g. Active", required: true, disabled: loading, maxLength: 50 }), _jsxs("div", { children: [_jsx("label", { style: {
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: 'var(--hit-muted-foreground, #64748b)',
                                    marginBottom: '6px',
                                }, children: "Color" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("input", { type: "color", value: color, onChange: (e) => setColor(e.target.value), disabled: loading, style: {
                                            width: '60px',
                                            height: '40px',
                                            padding: '2px',
                                            backgroundColor: 'var(--hit-input-bg, #ffffff)',
                                            border: '1px solid var(--hit-border-default, #cbd5e1)',
                                            borderRadius: '6px',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            opacity: loading ? 0.5 : 1,
                                        } }), _jsx(Input, { value: color, onChange: setColor, placeholder: "#64748b", disabled: loading, className: "flex-1" })] })] }), _jsx(Input, { label: "Sort Order", value: sortOrder, onChange: setSortOrder, placeholder: "0", disabled: loading, type: "number" }), _jsx(Select, { label: "Active?", value: isActive ? 'yes' : 'no', onChange: (v) => setIsActive(String(v) === 'yes'), options: [
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ], disabled: loading }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading || !label.trim(), children: "Save Changes" })] })] }) }) }));
}
export default EditProjectStatus;
