'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useAlertDialog } from '@hit/ui-kit/hooks/useAlertDialog';
import { useFormSubmit } from '@hit/ui-kit/hooks/useFormSubmit';
import { useProjectStatus } from '../hooks/useProjectStatuses';
import { Trash2 } from 'lucide-react';
export function EditProjectStatus(props) {
    const { Page, Card, Button, Input, Select, AlertDialog, ColorPicker, Alert } = useUi();
    const alertDialog = useAlertDialog();
    const statusId = props.id;
    const { status, loading: statusLoading, updateStatus, deleteStatus } = useProjectStatus(statusId);
    const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError, setError } = useFormSubmit();
    const [label, setLabel] = useState('');
    const [color, setColor] = useState('#64748b');
    const [sortOrder, setSortOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const [deleting, setDeleting] = useState(false);
    useEffect(() => {
        if (status) {
            setLabel(status.label);
            setColor(status.color || '#64748b');
            setSortOrder(String(status.sortOrder || 0));
            setIsActive(status.isActive);
        }
    }, [status]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!statusId)
            return;
        const errors = {};
        if (!label.trim()) {
            errors.label = 'Label is required';
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0)
            return;
        const result = await submit(async () => {
            await updateStatus({
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
    const handleDelete = async () => {
        if (!statusId || !status)
            return;
        const confirmed = await alertDialog.showConfirm(`Are you sure you want to delete "${status.label}"? This cannot be undone.`, {
            variant: 'error',
            title: 'Delete Status',
            confirmText: 'Delete',
        });
        if (!confirmed)
            return;
        setDeleting(true);
        try {
            await deleteStatus();
            window.location.href = '/projects/setup/statuses';
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete status');
            setDeleting(false);
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
            { label: status.label },
        ]
        : [
            { label: 'Projects', href: '/projects' },
            { label: 'Setup', href: '/projects/setup/statuses' },
            { label: 'Statuses', href: '/projects/setup/statuses' },
            { label: 'Status' },
        ];
    if (statusLoading) {
        return (_jsx(Page, { title: "Edit Status", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px' }, children: "Loading status..." }) }) }));
    }
    if (!status) {
        return (_jsx(Page, { title: "Edit Status", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsxs(Card, { children: [_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }, children: "Status not found" }), _jsx("div", { style: { textAlign: 'center', marginTop: '16px' }, children: _jsx(Button, { variant: "secondary", onClick: () => (window.location.href = '/projects/setup/statuses'), children: "Back to Statuses" }) })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(AlertDialog, { ...alertDialog.props }), _jsx(Page, { title: "Edit Status", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx(Alert, { variant: "error", title: "Error", onClose: clearError, children: error.message })), _jsx(Input, { label: "Label", value: label, onChange: (v) => { setLabel(v); clearFieldError('label'); }, placeholder: "e.g. Active", required: true, disabled: submitting || deleting, maxLength: 50, error: fieldErrors.label }), _jsx(ColorPicker, { label: "Color", value: color, onChange: setColor, placeholder: "#64748b", disabled: submitting || deleting }), _jsx(Input, { label: "Sort Order", value: sortOrder, onChange: setSortOrder, placeholder: "0", disabled: submitting || deleting, type: "number" }), _jsx(Select, { label: "Active?", value: isActive ? 'yes' : 'no', onChange: (v) => setIsActive(String(v) === 'yes'), options: [
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no', label: 'No' },
                                ], disabled: submitting || deleting }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }, children: [_jsxs(Button, { type: "button", variant: "danger", onClick: handleDelete, disabled: submitting || deleting, children: [_jsx(Trash2, { size: 16, style: { marginRight: '8px' } }), deleting ? 'Deleting...' : 'Delete'] }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: submitting || deleting, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: submitting || deleting || !label.trim(), children: submitting ? 'Saving...' : 'Save Changes' })] })] })] }) }) })] }));
}
export default EditProjectStatus;
