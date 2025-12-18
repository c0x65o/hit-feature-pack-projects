'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProject, useProjectMilestones, useProjectGroups, useProjectLinks, useProjectActivity, } from '../hooks/useProjects';
import { ProjectStatusBadge, SummaryCard, GroupRoleEditor, MilestoneInlineEditor, ActivityFeed, LinksEditor, } from '../components';
import { Edit, Archive, Plus } from 'lucide-react';
export function ProjectDetail(props) {
    const { Page, Card, Button, Input } = useUi();
    const projectId = props.id;
    const { project, loading: projectLoading, refresh: refreshProject } = useProject(projectId);
    const { milestones, loading: milestonesLoading, createMilestone, updateMilestone, deleteMilestone } = useProjectMilestones(projectId);
    const { groups, loading: groupsLoading, addGroup, updateGroupRole, removeGroup } = useProjectGroups(projectId);
    const { links, loading: linksLoading, addLink, removeLink } = useProjectLinks(projectId);
    const [activityFilter, setActivityFilter] = useState('');
    const { activity, loading: activityLoading } = useProjectActivity(projectId, activityFilter);
    const [addingMilestone, setAddingMilestone] = useState(false);
    const [newMilestoneName, setNewMilestoneName] = useState('');
    const [newMilestoneDate, setNewMilestoneDate] = useState('');
    const [creatingMilestone, setCreatingMilestone] = useState(false);
    const openMilestones = useMemo(() => milestones.filter((m) => m.status !== 'completed').length, [milestones]);
    const totalMilestones = milestones.length;
    const handleEdit = () => {
        if (projectId) {
            window.location.href = `/projects/${projectId}/edit`;
        }
    };
    const handleArchive = async () => {
        if (!projectId || !confirm('Archive this project?'))
            return;
        try {
            // This would call an archive API endpoint
            // For now, we'll use updateProject to set status to archived
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'archived' }),
            });
            if (res.ok) {
                refreshProject();
            }
        }
        catch (err) {
            console.error('Failed to archive project:', err);
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
    const canArchive = true; // TODO: Check actual permissions
    const canManageGroups = true; // TODO: Check actual permissions
    const canManageMilestones = true; // TODO: Check actual permissions
    const canManageLinks = true; // TODO: Check actual permissions
    return (_jsxs(Page, { title: project.name, actions: _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [canEdit && (_jsxs(Button, { variant: "secondary", onClick: handleEdit, children: [_jsx(Edit, { size: 16, style: { marginRight: '8px' } }), "Edit"] })), canArchive && (_jsxs(Button, { variant: "secondary", onClick: handleArchive, children: [_jsx(Archive, { size: 16, style: { marginRight: '8px' } }), "Archive"] }))] }), children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }, children: [_jsx(ProjectStatusBadge, { status: project.status, canChange: canEdit }), project.slug && (_jsxs("span", { style: { fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)' }, children: ["Slug: ", project.slug] }))] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }, children: [_jsx(SummaryCard, { title: "Milestones", value: `${openMilestones} open`, subtitle: `${totalMilestones} total` }), _jsx(SummaryCard, { title: "Groups", value: groups.length, subtitle: "with roles" }), _jsx(SummaryCard, { title: "Links", value: links.length, subtitle: "linked entities" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '24px' }, children: [_jsxs(Card, { title: "Overview", children: [project.description ? (_jsx("div", { style: { fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px' }, children: project.description })) : (_jsx("div", { style: { fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '16px' }, children: "No description." })), _jsxs("dl", { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 16px', fontSize: '14px' }, children: [_jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Status:" }), _jsx("dd", { children: _jsx(ProjectStatusBadge, { status: project.status }) }), project.slug && (_jsxs(_Fragment, { children: [_jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Slug:" }), _jsx("dd", { children: project.slug })] })), _jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Created:" }), _jsx("dd", { children: new Date(project.createdOnTimestamp).toLocaleDateString() }), _jsx("dt", { style: { fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Updated:" }), _jsx("dd", { children: new Date(project.lastUpdatedOnTimestamp).toLocaleDateString() })] })] }), _jsx(Card, { title: "Milestones", footer: canManageMilestones &&
                                    (addingMilestone ? (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx(Input, { placeholder: "Milestone name", value: newMilestoneName, onChange: setNewMilestoneName }), _jsx(Input, { type: "date", value: newMilestoneDate, onChange: setNewMilestoneDate }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Button, { variant: "primary", size: "sm", onClick: handleAddMilestone, disabled: creatingMilestone || !newMilestoneName.trim(), children: "Add Milestone" }), _jsx(Button, { variant: "secondary", size: "sm", onClick: () => {
                                                            setAddingMilestone(false);
                                                            setNewMilestoneName('');
                                                            setNewMilestoneDate('');
                                                        }, disabled: creatingMilestone, children: "Cancel" })] })] })) : (_jsxs(Button, { variant: "secondary", size: "sm", onClick: () => setAddingMilestone(true), children: [_jsx(Plus, { size: 16, style: { marginRight: '8px' } }), "Add Milestone"] }))), children: milestonesLoading ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Loading milestones..." })) : milestones.length === 0 ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "No milestones yet." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: milestones.map((milestone) => (_jsx(MilestoneInlineEditor, { milestone: milestone, onUpdate: updateMilestone, onDelete: deleteMilestone, canManage: canManageMilestones }, milestone.id))) })) }), _jsx(GroupRoleEditor, { groups: groups, onAdd: addGroup, onUpdate: updateGroupRole, onRemove: removeGroup, canManage: canManageGroups }), _jsx(ActivityFeed, { activities: activity, loading: activityLoading, filter: activityFilter, onFilterChange: setActivityFilter })] }), _jsx("div", { children: _jsx(LinksEditor, { links: links, onAdd: addLink, onRemove: removeLink, canManage: canManageLinks }) })] })] }));
}
export default ProjectDetail;
