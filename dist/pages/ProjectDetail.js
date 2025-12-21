'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi, useAlertDialog } from '@hit/ui-kit';
import { useProject, useProjectActivity, useProjectActivityTypes, } from '../hooks/useProjects';
import { LinkedEntityTabs } from '@hit/feature-pack-forms';
import { ProjectStatusBadge, ActivityFeed, } from '../components';
import { Edit, Trash2 } from 'lucide-react';
export function ProjectDetail(props) {
    const { Page, Card, Button, Input, AlertDialog, Modal, TextArea } = useUi();
    const alertDialog = useAlertDialog();
    const projectId = props.id;
    const { project, loading: projectLoading, refresh: refreshProject } = useProject(projectId);
    const { activityTypes } = useProjectActivityTypes();
    const [activityFilter, setActivityFilter] = useState('');
    const { activity, loading: activityLoading, createActivity } = useProjectActivity(projectId, activityFilter);
    const [showAddActivityModal, setShowAddActivityModal] = useState(false);
    const [formTypeId, setFormTypeId] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formLink, setFormLink] = useState('');
    const [formOccurredAt, setFormOccurredAt] = useState(new Date().toISOString().slice(0, 16));
    const [creatingActivity, setCreatingActivity] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const handleEdit = () => {
        if (projectId) {
            window.location.href = `/projects/${projectId}/edit`;
        }
    };
    const handleDelete = async () => {
        if (!projectId || !project)
            return;
        const confirmed = await alertDialog.showConfirm(`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone and will delete all project data including links and activity.`, {
            variant: 'error',
            title: 'Delete Project',
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
        if (!confirmed)
            return;
        try {
            setDeleting(true);
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to delete project');
            }
            // Redirect to projects list after successful deletion
            if (props.onNavigate) {
                props.onNavigate('/projects');
            }
            else {
                window.location.href = '/projects';
            }
        }
        catch (err) {
            console.error('Failed to delete project:', err);
            await alertDialog.showAlert(err instanceof Error ? err.message : 'Failed to delete project', {
                variant: 'error',
                title: 'Error',
            });
        }
        finally {
            setDeleting(false);
        }
    };
    const handleAddActivity = async () => {
        if (!formTypeId || !formTitle.trim())
            return;
        setCreatingActivity(true);
        try {
            await createActivity({
                typeId: formTypeId,
                title: formTitle.trim(),
                description: formDescription.trim() || undefined,
                link: formLink.trim() || undefined,
                occurredAt: formOccurredAt || undefined,
            });
            setFormTypeId('');
            setFormTitle('');
            setFormDescription('');
            setFormLink('');
            setFormOccurredAt(new Date().toISOString().slice(0, 16));
            setShowAddActivityModal(false);
        }
        catch (err) {
            console.error('Failed to create activity:', err);
            await alertDialog.showAlert(err instanceof Error ? err.message : 'Failed to create activity', {
                variant: 'error',
                title: 'Error',
            });
        }
        finally {
            setCreatingActivity(false);
        }
    };
    if (projectLoading) {
        return (_jsx(Page, { title: "Project", children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px' }, children: "Loading project..." }) }) }));
    }
    if (!project) {
        return (_jsx(Page, { title: "Project", children: _jsxs(Card, { children: [_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }, children: "Project not found" }), _jsx("div", { style: { textAlign: 'center', marginTop: '16px' }, children: _jsx(Button, { variant: "secondary", onClick: () => (window.location.href = '/projects'), children: "Back to Projects" }) })] }) }));
    }
    // Permission checks (these would come from your auth system)
    const canEdit = true; // TODO: Check actual permissions
    const canDelete = true; // TODO: Check actual permissions
    const navigate = (path) => {
        if (props.onNavigate) {
            props.onNavigate(path);
        }
        else {
            window.location.href = path;
        }
    };
    const breadcrumbs = [
        { label: 'Projects', href: '/projects' },
        { label: project.name },
    ];
    return (_jsxs(_Fragment, { children: [_jsx(AlertDialog, { ...alertDialog.props }), _jsxs(Page, { title: project.name, breadcrumbs: breadcrumbs, onNavigate: navigate, actions: _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [canEdit && (_jsxs(Button, { variant: "secondary", onClick: handleEdit, children: [_jsx(Edit, { size: 16, style: { marginRight: '8px' } }), "Edit"] })), canDelete && (_jsxs(Button, { variant: "danger", onClick: handleDelete, disabled: deleting, children: [_jsx(Trash2, { size: 16, style: { marginRight: '8px' } }), deleting ? 'Deleting...' : 'Delete'] }))] }), children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }, children: [_jsx(ProjectStatusBadge, { statusId: String(project.statusId || ''), canChange: canEdit }), project.slug && (_jsxs("span", { style: { fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)' }, children: ["Slug: ", project.slug] }))] }), _jsx(LinkedEntityTabs, { entity: { kind: 'project', id: projectId }, overview: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs(Card, { title: "Overview", children: [project.description ? (_jsx("div", { style: { fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px' }, children: project.description })) : (_jsx("div", { style: { fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '16px' }, children: "No description." })), _jsxs("dl", { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 16px', fontSize: '14px' }, children: [_jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Status:" }), _jsx("dd", { children: _jsx(ProjectStatusBadge, { statusId: String(project.statusId || '') }) }), project.slug && (_jsxs(_Fragment, { children: [_jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Slug:" }), _jsx("dd", { children: project.slug })] })), _jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Created:" }), _jsx("dd", { children: new Date(project.createdOnTimestamp).toLocaleDateString() }), _jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Updated:" }), _jsx("dd", { children: new Date(project.lastUpdatedOnTimestamp).toLocaleDateString() })] })] }), _jsx(ActivityFeed, { activities: activity, loading: activityLoading, filter: activityFilter, onFilterChange: setActivityFilter, onAddActivity: canEdit ? () => setShowAddActivityModal(true) : undefined })] }), onNavigate: navigate }), _jsx(Modal, { open: showAddActivityModal, onClose: () => setShowAddActivityModal(false), title: "Add Activity", children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Activity Type *" }), _jsxs("select", { value: formTypeId, onChange: (e) => setFormTypeId(e.target.value), style: {
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid var(--hit-border, #e2e8f0)',
                                                borderRadius: '6px',
                                                fontSize: '14px',
                                            }, children: [_jsx("option", { value: "", children: "Select type..." }), activityTypes.map((type) => (_jsx("option", { value: type.id, children: type.name }, type.id)))] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Title *" }), _jsx(Input, { value: formTitle, onChange: setFormTitle, placeholder: "e.g., Winter Sale 2024" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "When did this occur? *" }), _jsx(Input, { type: "datetime-local", value: formOccurredAt, onChange: setFormOccurredAt })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Description" }), _jsx(TextArea, { value: formDescription, onChange: setFormDescription, placeholder: "What happened?", rows: 4 })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Link (optional)" }), _jsx(Input, { value: formLink, onChange: setFormLink, placeholder: "https://..." })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { variant: "secondary", onClick: () => setShowAddActivityModal(false), disabled: creatingActivity, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleAddActivity, disabled: creatingActivity || !formTypeId || !formTitle.trim(), children: creatingActivity ? 'Adding...' : 'Add Activity' })] })] }) })] })] }));
}
export default ProjectDetail;
