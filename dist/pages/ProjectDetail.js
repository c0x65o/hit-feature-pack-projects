'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useCallback } from 'react';
import { useUi, useAlertDialog } from '@hit/ui-kit';
import { useProject, useProjectMilestones, useProjectActivity, useProjectForms, useProjectFormEntries, } from '../hooks/useProjects';
import { ProjectStatusBadge, SummaryCard, MilestoneInlineEditor, ActivityFeed, } from '../components';
import { Edit, Plus, Trash2 } from 'lucide-react';
export function ProjectDetail(props) {
    const { Page, Card, Button, Input, AlertDialog, Tabs, DataTable, Alert } = useUi();
    const alertDialog = useAlertDialog();
    const projectId = props.id;
    const { project, loading: projectLoading, refresh: refreshProject } = useProject(projectId);
    const { milestones, loading: milestonesLoading, createMilestone, updateMilestone, deleteMilestone } = useProjectMilestones(projectId);
    const [activityFilter, setActivityFilter] = useState('');
    const { activity, loading: activityLoading } = useProjectActivity(projectId, activityFilter);
    const { forms: projectForms, loading: formsLoading } = useProjectForms(projectId);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedFormId, setSelectedFormId] = useState(undefined);
    const [selectedEntityFieldKey, setSelectedEntityFieldKey] = useState(undefined);
    const [page, setPage] = useState(1);
    const { data: formEntriesData, loading: entriesLoading, refresh: refreshEntries } = useProjectFormEntries(projectId, selectedFormId, { page, pageSize: 25, entityFieldKey: selectedEntityFieldKey });
    const [addingMilestone, setAddingMilestone] = useState(false);
    const [newMilestoneName, setNewMilestoneName] = useState('');
    const [newMilestoneDate, setNewMilestoneDate] = useState('');
    const [creatingMilestone, setCreatingMilestone] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const openMilestones = useMemo(() => milestones.filter((m) => m.status !== 'completed').length, [milestones]);
    const totalMilestones = milestones.length;
    // Handle tab change - set selected form ID when a form tab is clicked
    const handleTabChange = useCallback((tabId) => {
        setActiveTab(tabId);
        if (tabId === 'overview') {
            setSelectedFormId(undefined);
            setSelectedEntityFieldKey(undefined);
        }
        else {
            setSelectedFormId(tabId);
            // Find the form info to get the entityFieldKey
            const formInfo = projectForms.find((f) => f.formId === tabId);
            setSelectedEntityFieldKey(formInfo?.entityFieldKey);
        }
        setPage(1); // Reset to first page when switching tabs
    }, [projectForms]);
    // Build tabs array: Overview + one per form
    const tabs = useMemo(() => {
        const tabItems = [
            {
                id: 'overview',
                label: 'Overview',
                content: null, // Will be rendered separately
            },
        ];
        // Add tabs for each form with project reference field (even if count is 0)
        projectForms.forEach((form) => {
            tabItems.push({
                id: form.formId,
                label: form.count > 0 ? `${form.formName} (${form.count})` : form.formName,
                content: null, // Will be rendered separately
            });
        });
        return tabItems;
    }, [projectForms]);
    // Get current form info for selected tab
    const selectedFormInfo = useMemo(() => {
        if (!selectedFormId)
            return null;
        return projectForms.find((f) => f.formId === selectedFormId) || null;
    }, [selectedFormId, projectForms]);
    // Build visible fields for form entries table
    const visibleFields = useMemo(() => {
        return (formEntriesData?.fields || [])
            .filter((f) => !f.hidden && (f.showInTable !== false))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            .slice(0, 10);
    }, [formEntriesData?.fields]);
    // Build columns for form entries table
    const formEntryColumns = useMemo(() => {
        const dynamicCols = visibleFields.map((f) => {
            return {
                key: f.key,
                label: f.label,
                sortable: false,
                render: (_, row) => {
                    const v = row.data?.[f.key];
                    if (v === undefined || v === null)
                        return '';
                    if (f.type === 'url') {
                        const s = String(v);
                        if (!s.trim())
                            return '';
                        return (_jsx("a", { className: "text-sm hover:text-blue-500 underline", href: s, target: "_blank", rel: "noreferrer", children: s }));
                    }
                    if (f.type === 'datetime' || f.type === 'date') {
                        try {
                            const date = new Date(String(v));
                            if (!isNaN(date.getTime())) {
                                return f.type === 'datetime'
                                    ? date.toLocaleString()
                                    : date.toLocaleDateString();
                            }
                        }
                        catch {
                            // Fall through to string display
                        }
                    }
                    // Friendly display for reference fields
                    if (Array.isArray(v)) {
                        return v
                            .map((x) => x?.label || x?.entryId || x?.entityId || '')
                            .filter(Boolean)
                            .join(', ');
                    }
                    if (typeof v === 'object') {
                        return v.label || v.entryId || v.entityId || '';
                    }
                    return String(v);
                },
            };
        });
        return [
            ...dynamicCols,
            {
                key: 'updatedAt',
                label: 'Updated',
                sortable: true,
                render: (v) => (v ? new Date(String(v)).toLocaleString() : ''),
            },
        ];
    }, [visibleFields]);
    // Build rows for form entries table
    const formEntryRows = useMemo(() => {
        return (formEntriesData?.items || []).map((e) => ({
            id: e.id,
            data: e.data,
            updatedAt: e.updatedAt,
        }));
    }, [formEntriesData?.items]);
    const handleEdit = () => {
        if (projectId) {
            window.location.href = `/projects/${projectId}/edit`;
        }
    };
    const handleDelete = async () => {
        if (!projectId || !project)
            return;
        const confirmed = await alertDialog.showConfirm(`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone and will delete all project data including milestones, links, and activity.`, {
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
    const handleAddMilestone = async () => {
        if (!newMilestoneName.trim())
            return;
        setCreatingMilestone(true);
        try {
            await createMilestone({
                name: newMilestoneName.trim(),
                targetDate: newMilestoneDate || undefined,
                status: 'planned',
            });
            setNewMilestoneName('');
            setNewMilestoneDate('');
            setAddingMilestone(false);
        }
        catch (err) {
            console.error('Failed to create milestone:', err);
        }
        finally {
            setCreatingMilestone(false);
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
    const canManageMilestones = true; // TODO: Check actual permissions
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
    return (_jsxs(_Fragment, { children: [_jsx(AlertDialog, { ...alertDialog.props }), _jsxs(Page, { title: project.name, breadcrumbs: breadcrumbs, onNavigate: navigate, actions: _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [canEdit && (_jsxs(Button, { variant: "secondary", onClick: handleEdit, children: [_jsx(Edit, { size: 16, style: { marginRight: '8px' } }), "Edit"] })), canDelete && (_jsxs(Button, { variant: "danger", onClick: handleDelete, disabled: deleting, children: [_jsx(Trash2, { size: 16, style: { marginRight: '8px' } }), deleting ? 'Deleting...' : 'Delete'] }))] }), children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }, children: [_jsx(ProjectStatusBadge, { status: project.statusLabel || '', canChange: canEdit }), project.slug && (_jsxs("span", { style: { fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)' }, children: ["Slug: ", project.slug] }))] }), tabs.length > 0 && (_jsx("div", { style: { marginBottom: '24px' }, children: _jsx(Tabs, { tabs: tabs, value: activeTab, onValueChange: handleTabChange }) })), activeTab === 'overview' && (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }, children: _jsx(SummaryCard, { title: "Milestones", value: `${openMilestones} open`, subtitle: `${totalMilestones} total` }) }), _jsxs(Card, { title: "Overview", children: [project.description ? (_jsx("div", { style: { fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px' }, children: project.description })) : (_jsx("div", { style: { fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '16px' }, children: "No description." })), _jsxs("dl", { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 16px', fontSize: '14px' }, children: [_jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Status:" }), _jsx("dd", { children: _jsx(ProjectStatusBadge, { status: project.statusLabel || '' }) }), project.slug && (_jsxs(_Fragment, { children: [_jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Slug:" }), _jsx("dd", { children: project.slug })] })), _jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Created:" }), _jsx("dd", { children: new Date(project.createdOnTimestamp).toLocaleDateString() }), _jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Updated:" }), _jsx("dd", { children: new Date(project.lastUpdatedOnTimestamp).toLocaleDateString() })] })] }), _jsx(Card, { title: "Milestones", footer: canManageMilestones &&
                                    (addingMilestone ? (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx(Input, { placeholder: "Milestone name", value: newMilestoneName, onChange: setNewMilestoneName }), _jsx(Input, { type: "date", value: newMilestoneDate, onChange: setNewMilestoneDate }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Button, { variant: "primary", size: "sm", onClick: handleAddMilestone, disabled: creatingMilestone || !newMilestoneName.trim(), children: "Add Milestone" }), _jsx(Button, { variant: "secondary", size: "sm", onClick: () => {
                                                            setAddingMilestone(false);
                                                            setNewMilestoneName('');
                                                            setNewMilestoneDate('');
                                                        }, disabled: creatingMilestone, children: "Cancel" })] })] })) : (_jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setAddingMilestone(true), children: [_jsx(Plus, { size: 16, style: { marginRight: '8px' } }), "Add Milestone"] }))), children: milestonesLoading ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Loading milestones..." })) : milestones.length === 0 ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "No milestones yet." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: milestones.map((milestone) => (_jsx(MilestoneInlineEditor, { milestone: milestone, onUpdate: updateMilestone, onDelete: deleteMilestone, canManage: canManageMilestones }, milestone.id))) })) }), _jsx(ActivityFeed, { activities: activity, loading: activityLoading, filter: activityFilter, onFilterChange: setActivityFilter })] })), activeTab !== 'overview' && selectedFormId && (_jsx(Card, { title: selectedFormInfo?.formName || 'Loading...', children: !selectedFormInfo ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Loading form information..." })) : entriesLoading ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Loading entries..." })) : formEntriesData?.items.length === 0 ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "No entries found for this project." })) : (_jsx(DataTable, { columns: formEntryColumns, data: formEntryRows, emptyMessage: "No entries found", loading: entriesLoading, searchable: true, pageSize: 25, page: page, total: formEntriesData?.pagination.total, onPageChange: setPage, manualPagination: true, onRefresh: refreshEntries, refreshing: entriesLoading, onRowClick: (row) => navigate(`/forms/${selectedFormId}/entries/${row.id}`) })) }))] })] }));
}
export default ProjectDetail;
