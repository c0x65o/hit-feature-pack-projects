'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUi, useAlertDialog } from '@hit/ui-kit';
import { useProjectActivityType } from '../hooks/useProjectActivityTypes';
import { Trash2 } from 'lucide-react';
const CATEGORIES = [
    { value: 'project', label: 'Project' },
    { value: 'release', label: 'Release' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'ops', label: 'Operations' },
    { value: 'content', label: 'Content' },
    { value: 'other', label: 'Other' },
];
export function EditProjectActivityType(props) {
    const { Page, Card, Button, Input, Select, TextArea, AlertDialog } = useUi();
    const alertDialog = useAlertDialog();
    const activityTypeId = props.id;
    const { activityType, loading: activityTypeLoading, updateActivityType, deleteActivityType } = useProjectActivityType(activityTypeId);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('project');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [icon, setIcon] = useState('');
    const [sortOrder, setSortOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (activityType) {
            setName(activityType.name);
            setCategory(activityType.category || 'project');
            setDescription(activityType.description || '');
            setColor(activityType.color || '#3b82f6');
            setIcon(activityType.icon || '');
            setSortOrder(String(activityType.sortOrder || 0));
            setIsActive(activityType.isActive);
        }
    }, [activityType]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!activityTypeId)
            return;
        setError(null);
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        setLoading(true);
        try {
            await updateActivityType({
                name: name.trim(),
                category: category || null,
                description: description.trim() || null,
                color: color.trim() || null,
                icon: icon.trim() || null,
                sortOrder: Number(sortOrder || 0),
                isActive,
            });
            window.location.href = '/projects/setup/activity-types';
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update activity type');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async () => {
        if (!activityTypeId || !activityType)
            return;
        const confirmed = await alertDialog.showConfirm(`Are you sure you want to delete "${activityType.name}"? This cannot be undone.`, {
            variant: 'error',
            title: 'Delete Activity Type',
            confirmText: 'Delete',
        });
        if (!confirmed)
            return;
        setDeleting(true);
        try {
            await deleteActivityType();
            window.location.href = '/projects/setup/activity-types';
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete activity type');
            setDeleting(false);
        }
    };
    const handleCancel = () => {
        window.location.href = '/projects/setup/activity-types';
    };
    const navigate = (path) => {
        window.location.href = path;
    };
    const breadcrumbs = activityType
        ? [
            { label: 'Projects', href: '/projects' },
            { label: 'Setup', href: '/projects/setup/activity-types' },
            { label: 'Activity Types', href: '/projects/setup/activity-types' },
            { label: activityType.name },
        ]
        : [
            { label: 'Projects', href: '/projects' },
            { label: 'Setup', href: '/projects/setup/activity-types' },
            { label: 'Activity Types', href: '/projects/setup/activity-types' },
            { label: 'Activity Type' },
        ];
    if (activityTypeLoading) {
        return (_jsx(Page, { title: "Edit Activity Type", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px' }, children: "Loading activity type..." }) }) }));
    }
    if (!activityType) {
        return (_jsx(Page, { title: "Edit Activity Type", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsxs(Card, { children: [_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }, children: "Activity type not found" }), _jsx("div", { style: { textAlign: 'center', marginTop: '16px' }, children: _jsx(Button, { variant: "secondary", onClick: () => (window.location.href = '/projects/setup/activity-types'), children: "Back to Activity Types" }) })] }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(AlertDialog, { ...alertDialog.props }), _jsx(Page, { title: "Edit Activity Type", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx("div", { style: {
                                    padding: '12px',
                                    backgroundColor: 'var(--hit-error-light, rgba(239, 68, 68, 0.1))',
                                    border: '1px solid var(--hit-error, #ef4444)',
                                    borderRadius: '8px',
                                    color: 'var(--hit-error, #ef4444)',
                                    fontSize: '14px',
                                }, children: error })), _jsxs("div", { children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: 'var(--hit-muted-foreground, #64748b)',
                                            marginBottom: '6px',
                                        }, children: "Key (read-only)" }), _jsx(Input, { value: activityType.key, disabled: true, onChange: () => { } }), _jsx("p", { style: { fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '4px' }, children: "Key cannot be changed after creation" })] }), _jsx(Input, { label: "Name", value: name, onChange: setName, placeholder: "e.g. Game Launch", required: true, disabled: loading || deleting, maxLength: 255 }), _jsx(Select, { label: "Category", value: category, onChange: setCategory, options: CATEGORIES, disabled: loading || deleting }), _jsx(TextArea, { label: "Description", value: description, onChange: setDescription, placeholder: "What this activity type represents...", disabled: loading || deleting, rows: 3 }), _jsxs("div", { children: [_jsx("label", { style: {
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            color: 'var(--hit-muted-foreground, #64748b)',
                                            marginBottom: '6px',
                                        }, children: "Color" }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [_jsx("input", { type: "color", value: color, onChange: (e) => setColor(e.target.value), disabled: loading || deleting, style: {
                                                    width: '60px',
                                                    height: '40px',
                                                    padding: '2px',
                                                    backgroundColor: 'var(--hit-input-bg, #ffffff)',
                                                    border: '1px solid var(--hit-border-default, #cbd5e1)',
                                                    borderRadius: '6px',
                                                    cursor: loading || deleting ? 'not-allowed' : 'pointer',
                                                    opacity: loading || deleting ? 0.5 : 1,
                                                } }), _jsx(Input, { value: color, onChange: setColor, placeholder: "#3b82f6", disabled: loading || deleting, className: "flex-1" })] })] }), _jsx(Input, { label: "Icon", value: icon, onChange: setIcon, placeholder: "e.g. rocket (lucide icon name)", disabled: loading || deleting, maxLength: 100 }), _jsx("p", { style: { fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '-12px' }, children: "Lucide icon name (optional)" }), _jsx(Input, { label: "Sort Order", value: sortOrder, onChange: setSortOrder, placeholder: "0", disabled: loading || deleting, type: "number" }), _jsx(Select, { label: "Active?", value: isActive ? 'yes' : 'no', onChange: (v) => setIsActive(String(v) === 'yes'), options: [
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no', label: 'No' },
                                ], disabled: loading || deleting || activityType.isSystem }), activityType.isSystem && (_jsx("p", { style: { fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '-12px' }, children: "System activity types cannot be deactivated" })), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }, children: [_jsxs(Button, { type: "button", variant: "danger", onClick: handleDelete, disabled: loading || deleting || activityType.isSystem, children: [_jsx(Trash2, { size: 16, style: { marginRight: '8px' } }), deleting ? 'Deleting...' : 'Delete'] }), activityType.isSystem && (_jsx("p", { style: { fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', alignSelf: 'center' }, children: "System activity types cannot be deleted" })), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: loading || deleting, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading || deleting || !name.trim(), children: "Save Changes" })] })] })] }) }) })] }));
}
export default EditProjectActivityType;
