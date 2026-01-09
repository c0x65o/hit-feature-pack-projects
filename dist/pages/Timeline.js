'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useUi } from '@hit/ui-kit';
import { useAlertDialog } from '@hit/ui-kit/hooks/useAlertDialog';
import { useProjectActivityTypes } from '../hooks/useProjectActivityTypes';
import { Plus, Edit, Trash2 } from 'lucide-react';
export function Timeline() {
    const { Page, Card, Button, Input, Modal, TextArea, AlertDialog } = useUi();
    const alertDialog = useAlertDialog();
    const { activityTypes } = useProjectActivityTypes();
    const [activities, setActivities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Modal state
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const [formProjectId, setFormProjectId] = useState('');
    const [formTypeId, setFormTypeId] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formLink, setFormLink] = useState('');
    const [formOccurredAt, setFormOccurredAt] = useState(new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);
    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/projects/activity/all');
            if (!res.ok) {
                throw new Error('Failed to fetch activities');
            }
            const json = await res.json();
            setActivities(json.data || []);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load activities');
        }
        finally {
            setLoading(false);
        }
    }, []);
    const fetchProjects = useCallback(async () => {
        try {
            const res = await fetch('/api/projects?pageSize=1000');
            if (!res.ok) {
                throw new Error('Failed to fetch projects');
            }
            const json = await res.json();
            setProjects(json.data?.items || []);
        }
        catch (err) {
            console.error('Failed to fetch projects:', err);
        }
    }, []);
    useEffect(() => {
        fetchActivities();
        fetchProjects();
    }, [fetchActivities, fetchProjects]);
    // Group activities by year
    const activitiesByYear = useMemo(() => {
        const grouped = {};
        activities.forEach((activity) => {
            const date = activity.occurredAt ? new Date(activity.occurredAt) : new Date(activity.createdAt);
            const year = date.getFullYear();
            if (!grouped[year]) {
                grouped[year] = [];
            }
            grouped[year].push(activity);
        });
        // Sort years descending
        const sortedYears = Object.keys(grouped)
            .map(Number)
            .sort((a, b) => b - a);
        return { grouped, sortedYears };
    }, [activities]);
    const formatDate = (date) => {
        if (!date)
            return 'Unknown';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const resetForm = () => {
        setFormProjectId('');
        setFormTypeId('');
        setFormTitle('');
        setFormDescription('');
        setFormLink('');
        setFormOccurredAt(new Date().toISOString().slice(0, 10));
        setEditingActivity(null);
    };
    const handleAddActivity = () => {
        resetForm();
        setShowActivityModal(true);
    };
    const handleEditActivity = (activity) => {
        setEditingActivity(activity);
        setFormProjectId(activity.projectId);
        setFormTypeId(activity.typeId || '');
        setFormTitle(activity.title || '');
        setFormDescription(activity.description || '');
        setFormLink(activity.link || '');
        setFormOccurredAt(activity.occurredAt
            ? new Date(activity.occurredAt).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10));
        setShowActivityModal(true);
    };
    const handleSaveActivity = async () => {
        const projectId = editingActivity ? editingActivity.projectId : formProjectId;
        if (!projectId || !formTypeId || !formTitle.trim())
            return;
        setSaving(true);
        try {
            if (editingActivity) {
                // Update existing activity
                const res = await fetch(`/api/projects/${projectId}/activity/${editingActivity.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        typeId: formTypeId,
                        title: formTitle.trim(),
                        description: formDescription.trim() || undefined,
                        link: formLink.trim() || undefined,
                        occurredAt: formOccurredAt || undefined,
                    }),
                });
                if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    throw new Error(json?.error || 'Failed to update activity');
                }
            }
            else {
                // Create new activity
                const res = await fetch(`/api/projects/${projectId}/activity`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        typeId: formTypeId,
                        title: formTitle.trim(),
                        description: formDescription.trim() || undefined,
                        link: formLink.trim() || undefined,
                        occurredAt: formOccurredAt || undefined,
                    }),
                });
                if (!res.ok) {
                    const json = await res.json().catch(() => ({}));
                    throw new Error(json?.error || 'Failed to create activity');
                }
            }
            resetForm();
            setShowActivityModal(false);
            await fetchActivities();
        }
        catch (err) {
            console.error('Failed to save activity:', err);
            await alertDialog.showAlert(err instanceof Error ? err.message : 'Failed to save activity', { variant: 'error', title: 'Error' });
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeleteActivity = async (activity) => {
        const confirmed = await alertDialog.showConfirm('Are you sure you want to delete this activity? This action cannot be undone.', {
            variant: 'error',
            title: 'Delete Activity',
            confirmText: 'Delete',
            cancelText: 'Cancel',
        });
        if (!confirmed)
            return;
        try {
            const res = await fetch(`/api/projects/${activity.projectId}/activity/${activity.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Failed to delete activity');
            }
            await fetchActivities();
        }
        catch (err) {
            console.error('Failed to delete activity:', err);
            await alertDialog.showAlert(err instanceof Error ? err.message : 'Failed to delete activity', { variant: 'error', title: 'Error' });
        }
    };
    if (loading) {
        return (_jsx(Page, { title: "Timeline", children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px' }, children: "Loading timeline..." }) }) }));
    }
    if (error) {
        return (_jsx(Page, { title: "Timeline", children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }, children: error }) }) }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(AlertDialog, { ...alertDialog.props }), _jsx(Page, { title: "Timeline", actions: _jsxs(Button, { variant: "primary", onClick: handleAddActivity, children: [_jsx(Plus, { size: 16, style: { marginRight: '8px' } }), "Add Activity"] }), children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '32px' }, children: activitiesByYear.sortedYears.length === 0 ? (_jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "No activities yet." }) })) : (activitiesByYear.sortedYears.map((year) => {
                        const yearActivities = activitiesByYear.grouped[year];
                        return (_jsx(Card, { title: `${year}`, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: yearActivities.map((activity) => {
                                    const date = activity.occurredAt ? new Date(activity.occurredAt) : new Date(activity.createdAt);
                                    const typeDisplay = activity.activityTypeRecord;
                                    return (_jsxs("div", { style: {
                                            padding: '16px',
                                            border: '1px solid var(--hit-border, #e2e8f0)',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            gap: '16px',
                                        }, children: [_jsx("div", { style: {
                                                    minWidth: '120px',
                                                    fontSize: '14px',
                                                    color: 'var(--hit-muted-foreground, #64748b)',
                                                    fontWeight: '500',
                                                }, children: formatDate(date) }), _jsxs("div", { style: { flex: 1 }, children: [typeDisplay && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("span", { style: {
                                                                    fontSize: '12px',
                                                                    padding: '4px 8px',
                                                                    borderRadius: '4px',
                                                                    backgroundColor: typeDisplay.color || '#3b82f6',
                                                                    color: '#ffffff',
                                                                    fontWeight: '500',
                                                                }, children: typeDisplay.name }), activity.projectName && (_jsxs("span", { style: {
                                                                    fontSize: '12px',
                                                                    color: 'var(--hit-muted-foreground, #64748b)',
                                                                }, children: ["\u2022 ", activity.projectName] }))] })), _jsx("div", { style: { fontSize: '16px', fontWeight: '500', marginBottom: '4px' }, children: activity.title || activity.description || activity.activityType || 'Activity' }), activity.description && activity.title && (_jsx("div", { style: {
                                                            fontSize: '14px',
                                                            color: 'var(--hit-muted-foreground, #64748b)',
                                                            marginBottom: '4px',
                                                        }, children: activity.description })), activity.link && (_jsx("div", { style: { marginTop: '8px' }, children: _jsx("a", { href: activity.link, target: "_blank", rel: "noopener noreferrer", style: {
                                                                fontSize: '14px',
                                                                color: 'var(--hit-primary, #3b82f6)',
                                                                textDecoration: 'none',
                                                            }, children: activity.link }) }))] }), _jsxs("div", { style: { display: 'flex', gap: '4px', alignItems: 'flex-start' }, children: [_jsx("button", { onClick: () => handleEditActivity(activity), style: {
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: 'var(--hit-muted-foreground, #64748b)',
                                                        }, title: "Edit activity", children: _jsx(Edit, { size: 16 }) }), _jsx("button", { onClick: () => handleDeleteActivity(activity), style: {
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            color: 'var(--hit-error, #ef4444)',
                                                        }, title: "Delete activity", children: _jsx(Trash2, { size: 16 }) })] })] }, activity.id));
                                }) }) }, year));
                    })) }) }), _jsx(Modal, { open: showActivityModal, onClose: () => {
                    resetForm();
                    setShowActivityModal(false);
                }, title: editingActivity ? 'Edit Activity' : 'Add Activity', children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [!editingActivity && (_jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Project *" }), _jsxs("select", { value: formProjectId, onChange: (e) => setFormProjectId(e.target.value), style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid var(--hit-border, #e2e8f0)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                    }, children: [_jsx("option", { value: "", children: "Select project..." }), projects.map((project) => (_jsx("option", { value: project.id, children: project.name }, project.id)))] })] })), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Activity Type *" }), _jsxs("select", { value: formTypeId, onChange: (e) => setFormTypeId(e.target.value), style: {
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid var(--hit-border, #e2e8f0)',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                    }, children: [_jsx("option", { value: "", children: "Select type..." }), activityTypes.map((type) => (_jsx("option", { value: type.id, children: type.name }, type.id)))] })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Title *" }), _jsx(Input, { value: formTitle, onChange: setFormTitle, placeholder: "e.g., Winter Sale 2024" })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "When did this occur? *" }), _jsx(Input, { type: "date", value: formOccurredAt, onChange: setFormOccurredAt })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Description" }), _jsx(TextArea, { value: formDescription, onChange: setFormDescription, placeholder: "What happened?", rows: 4 })] }), _jsxs("div", { children: [_jsx("label", { style: { display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: "Link (optional)" }), _jsx(Input, { value: formLink, onChange: setFormLink, placeholder: "https://..." })] }), _jsxs("div", { style: { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }, children: [_jsx(Button, { variant: "secondary", onClick: () => {
                                        resetForm();
                                        setShowActivityModal(false);
                                    }, disabled: saving, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSaveActivity, disabled: saving || !formTypeId || !formTitle.trim() || (!editingActivity && !formProjectId), children: saving ? 'Saving...' : editingActivity ? 'Update Activity' : 'Add Activity' })] })] }) })] }));
}
export default Timeline;
