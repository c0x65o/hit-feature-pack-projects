'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useFormSubmit } from '@hit/ui-kit/hooks/useFormSubmit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
export function CreateProjectStatus() {
    const { Page, Card, Button, Input, Select, ColorPicker, Alert } = useUi();
    const { createStatus } = useProjectStatuses();
    const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError } = useFormSubmit();
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#64748b');
    const [sortOrder, setSortOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!label.trim()) {
            errors.label = 'Label is required';
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0)
            return;
        const result = await submit(async () => {
            await createStatus({
                label: label.trim(),
                color: color.trim() || null,
                sortOrder: Number(sortOrder || 0),
                isActive,
            });
            return { success: true };
        });
        if (result) {
            window.location.href = '/projects/setup/statuses';
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
    return (_jsx(Page, { title: "Create Status", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx(Alert, { variant: "error", title: "Error", onClose: clearError, children: error.message })), _jsx(Input, { label: "Label", value: label, onChange: (v) => { setLabel(v); clearFieldError('label'); }, placeholder: "e.g. Active", required: true, disabled: submitting, maxLength: 50, error: fieldErrors.label }), _jsx(ColorPicker, { label: "Color", value: color, onChange: setColor, placeholder: "#64748b", disabled: submitting }), _jsx(Input, { label: "Sort Order", value: sortOrder, onChange: setSortOrder, placeholder: "0", disabled: submitting, type: "number" }), _jsx(Select, { label: "Active?", value: isActive ? 'yes' : 'no', onChange: (v) => setIsActive(String(v) === 'yes'), options: [
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ], disabled: submitting }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: submitting, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: submitting || !label.trim(), children: submitting ? 'Creating...' : 'Create Status' })] })] }) }) }));
}
export default CreateProjectStatus;
