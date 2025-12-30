'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUi, useFormSubmit } from '@hit/ui-kit';
import { useProject, useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
export function EditProject(props) {
    const { Page, Card, Button, Input, TextArea, Select, Alert } = useUi();
    const projectId = props.id;
    const { project, loading: projectLoading } = useProject(projectId);
    const { updateProject } = useProjects();
    const { activeStatuses, loading: statusesLoading } = useProjectStatuses();
    const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError } = useFormSubmit();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [statusId, setStatusId] = useState('');
    useEffect(() => {
        if (project) {
            setName(project.name);
            setSlug(project.slug || '');
            setDescription(project.description || '');
            setStatusId(String(project.statusId || ''));
        }
    }, [project]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectId)
            return;
        const errors = {};
        if (!name.trim()) {
            errors.name = 'Project name is required';
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0)
            return;
        const result = await submit(async () => {
            await updateProject(projectId, {
                name: name.trim(),
                slug: slug.trim() || null,
                description: description.trim() || null,
                statusId,
            });
            return { id: projectId };
        });
        if (result) {
            window.location.href = `/projects/${projectId}`;
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
    return (_jsx(Page, { title: "Edit Project", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx(Alert, { variant: "error", title: "Error", onClose: clearError, children: error.message })), _jsx(Input, { label: "Project Name", value: name, onChange: (v) => { setName(v); clearFieldError('name'); }, placeholder: "Enter project name", required: true, disabled: submitting, error: fieldErrors.name }), _jsx(Input, { label: "Slug", value: slug, onChange: setSlug, placeholder: "URL-friendly identifier", disabled: submitting }), _jsx(TextArea, { label: "Description", value: description, onChange: setDescription, placeholder: "Optional description", rows: 4, disabled: submitting }), _jsx(Select, { label: "Status", value: statusId, onChange: (value) => setStatusId(String(value)), options: activeStatuses.map((s) => ({ value: s.id, label: s.label })), disabled: submitting || statusesLoading || !activeStatuses.length }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: submitting, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: submitting || !name.trim(), children: submitting ? 'Saving...' : 'Save Changes' })] })] }) }) }));
}
export default EditProject;
