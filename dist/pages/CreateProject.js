'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
export function CreateProject() {
    const { Page, Card, Button, Input, TextArea, Select } = useUi();
    const { createProject } = useProjects();
    const { activeStatuses, defaultStatusKey, loading: statusesLoading } = useProjectStatuses();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('active');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (defaultStatusKey) {
            setStatus((s) => (s ? s : defaultStatusKey));
        }
    }, [defaultStatusKey]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }
        setLoading(true);
        try {
            const project = await createProject({
                name: name.trim(),
                slug: slug.trim() || undefined,
                description: description.trim() || undefined,
                status,
            });
            window.location.href = `/projects/${project.data.id}`;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        window.location.href = '/projects';
    };
    const navigate = (path) => {
        window.location.href = path;
    };
    const breadcrumbs = [
        { label: 'Projects', href: '/projects' },
        { label: 'Create Project' },
    ];
    return (_jsx(Page, { title: "Create Project", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx("div", { style: {
                            padding: '12px',
                            backgroundColor: 'var(--hit-error-light, rgba(239, 68, 68, 0.1))',
                            border: '1px solid var(--hit-error, #ef4444)',
                            borderRadius: '8px',
                            color: 'var(--hit-error, #ef4444)',
                            fontSize: '14px',
                        }, children: error })), _jsx(Input, { label: "Project Name", value: name, onChange: setName, placeholder: "Enter project name", required: true, disabled: loading }), _jsx(Input, { label: "Slug", value: slug, onChange: setSlug, placeholder: "Optional - will be generated from name if omitted", disabled: loading }), _jsx(TextArea, { label: "Description", value: description, onChange: setDescription, placeholder: "Optional description", rows: 4, disabled: loading }), _jsx(Select, { label: "Status", value: status, onChange: (value) => setStatus(String(value)), options: activeStatuses.map((s) => ({ value: s.key, label: s.label })), disabled: loading || statusesLoading }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading || !name.trim(), children: "Create Project" })] })] }) }) }));
}
export default CreateProject;
