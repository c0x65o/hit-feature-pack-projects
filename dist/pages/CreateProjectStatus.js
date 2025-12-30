'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
export function CreateProjectStatus() {
    const { Page, Card, Button, Input, Select, ColorPicker } = useUi();
    const { createStatus } = useProjectStatuses();
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#64748b');
    const [sortOrder, setSortOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!label.trim()) {
            setError('Label is required');
            return;
        }
        setLoading(true);
        try {
            await createStatus({
                label: label.trim(),
                color: color.trim() || null,
                sortOrder: Number(sortOrder || 0),
                isActive,
            });
            window.location.href = '/projects/setup/statuses';
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create status');
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
    const breadcrumbs = [
        { label: 'Projects', href: '/projects' },
        { label: 'Setup', href: '/projects/setup/statuses' },
        { label: 'Statuses', href: '/projects/setup/statuses' },
        { label: 'Create Status' },
    ];
    return (_jsx(Page, { title: "Create Status", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx("div", { style: {
                            padding: '12px',
                            backgroundColor: 'var(--hit-error-light, rgba(239, 68, 68, 0.1))',
                            border: '1px solid var(--hit-error, #ef4444)',
                            borderRadius: '8px',
                            color: 'var(--hit-error, #ef4444)',
                            fontSize: '14px',
                        }, children: error })), _jsx(Input, { label: "Label", value: label, onChange: setLabel, placeholder: "e.g. Active", required: true, disabled: loading, maxLength: 50 }), _jsx(ColorPicker, { label: "Color", value: color, onChange: setColor, placeholder: "#64748b", disabled: loading }), _jsx(Input, { label: "Sort Order", value: sortOrder, onChange: setSortOrder, placeholder: "0", disabled: loading, type: "number" }), _jsx(Select, { label: "Active?", value: isActive ? 'yes' : 'no', onChange: (v) => setIsActive(String(v) === 'yes'), options: [
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ], disabled: loading }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading || !label.trim(), children: "Create Status" })] })] }) }) }));
}
export default CreateProjectStatus;
