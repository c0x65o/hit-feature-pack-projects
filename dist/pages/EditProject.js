'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProject, useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
export function EditProject(props) {
    const { Page, Card, Button, Input, TextArea, Select } = useUi();
    const projectId = props.id;
    const { project, loading: projectLoading } = useProject(projectId);
    const { updateProject } = useProjects();
    const { activeStatuses, loading: statusesLoading } = useProjectStatuses();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('active');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (project) {
            setName(project.name);
            setSlug(project.slug || '');
            setDescription(project.description || '');
            setStatus(String(project.status || 'active'));
        }
    }, [project]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectId)
            return;
        setError(null);
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }
        setLoading(true);
        try {
            await updateProject(projectId, {
                name: name.trim(),
                slug: slug.trim() || null,
                description: description.trim() || null,
                status,
            });
            window.location.href = `/projects/${projectId}`;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update project');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        if (projectId) {
            window.location.href = `/projects/${projectId}`;
        }
        else {
            window.location.href = '/projects';
        }
    };
    const navigate = (path) => {
        window.location.href = path;
    };
    const breadcrumbs = project
        ? [
            { label: 'Projects', href: '/projects' },
            { label: project.name, href: `/projects/${projectId}` },
            { label: 'Edit' },
        ]
        : [
            { label: 'Projects', href: '/projects' },
            { label: 'Edit Project' },
        ];
    if (projectLoading) {
        return (_jsx(Page, { title: "Edit Project", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px' }, children: "Loading project..." }) }) }));
    }
    if (!project) {
        return (_jsx(Page, { title: "Edit Project", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsxs(Card, { children: [_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }, children: "Project not found" }), _jsx("div", { style: { textAlign: 'center', marginTop: '16px' }, children: _jsx(Button, { variant: "secondary", onClick: () => (window.location.href = '/projects'), children: "Back to Projects" }) })] }) }));
    }
    return (_jsx(Page, { title: "Edit Project", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx("div", { style: {
                            padding: '12px',
                            backgroundColor: 'var(--hit-error-light, rgba(239, 68, 68, 0.1))',
                            border: '1px solid var(--hit-error, #ef4444)',
                            borderRadius: '8px',
                            color: 'var(--hit-error, #ef4444)',
                            fontSize: '14px',
                        }, children: error })), _jsx(Input, { label: "Project Name", value: name, onChange: setName, placeholder: "Enter project name", required: true, disabled: loading }), _jsx(Input, { label: "Slug", value: slug, onChange: setSlug, placeholder: "URL-friendly identifier", disabled: loading }), _jsx(TextArea, { label: "Description", value: description, onChange: setDescription, placeholder: "Optional description", rows: 4, disabled: loading }), _jsx(Select, { label: "Status", value: status, onChange: (value) => setStatus(String(value)), options: activeStatuses.map((s) => ({ value: s.key, label: s.label })), disabled: loading || statusesLoading }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: loading, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: loading || !name.trim(), children: "Save Changes" })] })] }) }) }));
}
export default EditProject;
