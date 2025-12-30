'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectActivityTypes } from '../hooks/useProjectActivityTypes';
const CATEGORIES = [
    { value: 'project', label: 'Project' },
    { value: 'release', label: 'Release' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'ops', label: 'Operations' },
    { value: 'content', label: 'Content' },
    { value: 'other', label: 'Other' },
];
export function CreateProjectActivityType() {
    const { Page, Card, Button, Input, Select, TextArea, ColorPicker } = useUi();
    const { createActivityType } = useProjectActivityTypes();
    const [key, setKey] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('project');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#3b82f6');
    const [icon, setIcon] = useState('');
    const [sortOrder, setSortOrder] = useState('0');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleKeyChange = (value) => {
        // Auto-format key: lowercase, alphanumeric + underscores only
        const formatted = value
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_{2,}/g, '_')
            .replace(/^_|_$/g, '');
        setKey(formatted);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!key.trim()) {
            setError('Key is required');
            return;
        }
        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        // Validate key format
        const keyRegex = /^[a-z0-9_]+$/;
        if (!keyRegex.test(key)) {
            setError('Key must be lowercase alphanumeric with underscores only');
            return;
        }
        setLoading(true);
        try {
            await createActivityType({
                key: key.trim(),
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
            setError(err instanceof Error ? err.message : 'Failed to create activity type');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        window.location.href = '/projects/setup/activity-types';
    };
    const navigate = (path) => {
        window.location.href = path;
    };
    const breadcrumbs = [
        { label: 'Projects', href: '/projects' },
        { label: 'Setup', href: '/projects/setup/activity-types' },
        { label: 'Activity Types', href: '/projects/setup/activity-types' },
        { label: 'Create Activity Type' },
    ];
    return (_jsx(Page, { title: "Create Activity Type", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx("div", { style: {
                            padding: '12px',
                            backgroundColor: 'var(--hit-error-light, rgba(239, 68, 68, 0.1))',
                            border: '1px solid var(--hit-error, #ef4444)',
                            borderRadius: '8px',
                            color: 'var(--hit-error, #ef4444)',
                            fontSize: '14px',
                        }, children: error })), _jsx(Input, { label: "Key", value: key, onChange: handleKeyChange, placeholder: "e.g. game_launch", required: true, disabled: loading, maxLength: 100 }), _jsx("p", { style: { fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '-12px' }, children: "Unique identifier (lowercase, alphanumeric, underscores only)" }), _jsx(Input, { label: "Name", value: name, onChange: setName, placeholder: "e.g. Game Launch", required: true, disabled: loading, maxLength: 255 }), _jsx(Select, { label: "Category", value: category, onChange: setCategory, options: CATEGORIES, disabled: loading }), _jsx(TextArea, { label: "Description", value: description, onChange: setDescription, placeholder: "What this activity type represents...", disabled: loading, rows: 3 }), _jsx(ColorPicker, { label: "Color", value: color, onChange: setColor, placeholder: "#3b82f6", disabled: loading }), _jsx(Input, { label: "Icon", value: icon, onChange: setIcon, placeholder: "e.g. rocket (lucide icon name)", disabled: loading, maxLength: 100 }), _jsx("p", { style: { fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '-12px' }, children: "Lucide icon name (optional)" }), _jsx(Input, { label: "Sort Order", value: sortOrder, onChange: setSortOrder, placeholder: "0", disabled: loading, type: "number" }), _jsx(Select, { label: "Active?", value: isActive ? 'yes' : 'no', onChange: (v) => setIsActive(String(v) === 'yes'), options: [
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ], disabled: loading }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading || !key.trim() || !name.trim(), children: "Create Activity Type" })] })] }) }) }));
}
export default CreateProjectActivityType;
