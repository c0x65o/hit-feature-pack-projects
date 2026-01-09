'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useFormSubmit } from '@hit/ui-kit/hooks/useFormSubmit';
import { useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
export function CreateProject() {
    const { Page, Card, Button, Input, TextArea, Select, Alert } = useUi();
    const { createProject } = useProjects();
    const { activeStatuses, loading: statusesLoading } = useProjectStatuses();
    const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError } = useFormSubmit();
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [statusId, setStatusId] = useState('');
    useEffect(() => {
        if (activeStatuses.length > 0 && !statusId) {
            // Set to first active status sorted by sortOrder
            const sorted = [...activeStatuses].sort((a, b) => a.sortOrder - b.sortOrder);
            setStatusId(sorted[0].id);
        }
    }, [activeStatuses, statusId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = {};
        if (!name.trim()) {
            errors.name = 'Project name is required';
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0)
            return;
        const result = await submit(async () => {
            const project = await createProject({
                name: name.trim(),
                slug: slug.trim() || undefined,
                description: description.trim() || undefined,
                statusId,
            });
            return { id: project.data.id };
        });
        if (result) {
            window.location.href = `/projects/${result.id}`;
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
    return (_jsx(Page, { title: "Create Project", breadcrumbs: breadcrumbs, onNavigate: navigate, children: _jsx(Card, { children: _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '20px' }, children: [error && (_jsx(Alert, { variant: "error", title: "Error", onClose: clearError, children: error.message })), _jsx(Input, { label: "Project Name", value: name, onChange: (v) => { setName(v); clearFieldError('name'); }, placeholder: "Enter project name", required: true, disabled: submitting, error: fieldErrors.name }), _jsx(Input, { label: "Slug", value: slug, onChange: setSlug, placeholder: "Optional - will be generated from name if omitted", disabled: submitting }), _jsx(TextArea, { label: "Description", value: description, onChange: setDescription, placeholder: "Optional description", rows: 4, disabled: submitting }), _jsx(Select, { label: "Status", value: statusId, onChange: (value) => setStatusId(String(value)), options: activeStatuses.map((s) => ({ value: s.id, label: s.label })), disabled: submitting || statusesLoading || !activeStatuses.length }), _jsxs("div", { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { type: "button", variant: "secondary", onClick: handleCancel, disabled: submitting, children: "Cancel" }), _jsx(Button, { type: "submit", variant: "primary", disabled: submitting || !name.trim(), children: submitting ? 'Creating...' : 'Create Project' })] })] }) }) }));
}
export default CreateProject;
