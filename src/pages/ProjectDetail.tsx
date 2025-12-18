'use client';

import React, { useState, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import {
  useProject,
  useProjectMilestones,
  useProjectGroups,
  useProjectLinks,
  useProjectActivity,
} from '../hooks/useProjects';
import {
  ProjectStatusBadge,
  SummaryCard,
  GroupRoleEditor,
  MilestoneInlineEditor,
  ActivityFeed,
  LinksEditor,
} from '../components';
import { Edit, Archive, MoreVertical, Plus } from 'lucide-react';

export function ProjectDetail(props: { id?: string; onNavigate?: (path: string) => void }) {
  const { Page, Card, Button, Input } = useUi();
  const projectId = props.id;
  const { project, loading: projectLoading, refresh: refreshProject } = useProject(projectId);
  const { milestones, loading: milestonesLoading, createMilestone, updateMilestone, deleteMilestone } =
    useProjectMilestones(projectId);
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
    if (!projectId || !confirm('Archive this project?')) return;
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
    } catch (err) {
      console.error('Failed to archive project:', err);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneName.trim()) return;
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
    } catch (err) {
      console.error('Failed to create milestone:', err);
    } finally {
      setCreatingMilestone(false);
    }
  };

  if (projectLoading) {
    return (
      <Page title="Project">
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading project...</div>
        </Card>
      </Page>
    );
  }

  if (!project) {
    return (
      <Page title="Project">
        <Card>
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }}>
            Project not found
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => (window.location.href = '/projects')}>
              Back to Projects
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  // Permission checks (these would come from your auth system)
  const canEdit = true; // TODO: Check actual permissions
  const canArchive = true; // TODO: Check actual permissions
  const canManageGroups = true; // TODO: Check actual permissions
  const canManageMilestones = true; // TODO: Check actual permissions
  const canManageLinks = true; // TODO: Check actual permissions

  return (
    <Page
      title={project.name}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          {canEdit && (
            <Button variant="secondary" onClick={handleEdit}>
              <Edit size={16} style={{ marginRight: '8px' }} />
              Edit
            </Button>
          )}
          {canArchive && (
            <Button variant="secondary" onClick={handleArchive}>
              <Archive size={16} style={{ marginRight: '8px' }} />
              Archive
            </Button>
          )}
        </div>
      }
    >
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <ProjectStatusBadge status={project.status as any} canChange={canEdit} />
        {project.slug && (
          <span style={{ fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)' }}>
            Slug: {project.slug}
          </span>
        )}
      </div>

      {/* Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <SummaryCard title="Milestones" value={`${openMilestones} open`} subtitle={`${totalMilestones} total`} />
        <SummaryCard title="Groups" value={groups.length} subtitle="with roles" />
        <SummaryCard title="Links" value={links.length} subtitle="linked entities" />
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Overview */}
          <Card title="Overview">
            {project.description ? (
              <div style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                {project.description}
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '16px' }}>
                No description.
              </div>
            )}
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 16px', fontSize: '14px' }}>
              <dt style={{ fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }}>Status:</dt>
              <dd>
                <ProjectStatusBadge status={project.status as any} />
              </dd>
              {project.slug && (
                <>
                  <dt style={{ fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }}>Slug:</dt>
                  <dd>{project.slug}</dd>
                </>
              )}
              <dt style={{ fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }}>Created:</dt>
              <dd>{new Date(project.createdOnTimestamp).toLocaleDateString()}</dd>
              <dt style={{ fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }}>Updated:</dt>
              <dd>{new Date(project.lastUpdatedOnTimestamp).toLocaleDateString()}</dd>
            </dl>
          </Card>

          {/* Milestones */}
          <Card
            title="Milestones"
            footer={
              canManageMilestones &&
              (addingMilestone ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Input
                    placeholder="Milestone name"
                    value={newMilestoneName}
                    onChange={setNewMilestoneName}
                  />
                  <Input
                    type="date"
                    value={newMilestoneDate}
                    onChange={setNewMilestoneDate}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="primary" size="sm" onClick={handleAddMilestone} disabled={creatingMilestone || !newMilestoneName.trim()}>
                      Add Milestone
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setAddingMilestone(false);
                        setNewMilestoneName('');
                        setNewMilestoneDate('');
                      }}
                      disabled={creatingMilestone}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setAddingMilestone(true)}>
                  <Plus size={16} style={{ marginRight: '8px' }} />
                  Add Milestone
                </Button>
              ))
            }
          >
            {milestonesLoading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
                Loading milestones...
              </div>
            ) : milestones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
                No milestones yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {milestones.map((milestone) => (
                  <MilestoneInlineEditor
                    key={milestone.id}
                    milestone={milestone}
                    onUpdate={updateMilestone}
                    onDelete={deleteMilestone}
                    canManage={canManageMilestones}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Groups */}
          <GroupRoleEditor
            groups={groups}
            onAdd={addGroup}
            onUpdate={updateGroupRole}
            onRemove={removeGroup}
            canManage={canManageGroups}
          />

          {/* Activity */}
          <ActivityFeed
            activities={activity}
            loading={activityLoading}
            filter={activityFilter}
            onFilterChange={setActivityFilter}
          />
        </div>

        {/* Right Column - Links */}
        <div>
          <LinksEditor links={links} onAdd={addLink} onRemove={removeLink} canManage={canManageLinks} />
        </div>
      </div>
    </Page>
  );
}

export default ProjectDetail;
