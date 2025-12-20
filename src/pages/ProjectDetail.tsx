'use client';

import React, { useState } from 'react';
import { useUi, useAlertDialog } from '@hit/ui-kit';
import {
  useProject,
  useProjectMilestones,
  useProjectActivity,
} from '../hooks/useProjects';
import { LinkedEntityTabs } from '@hit/feature-pack-forms';
import {
  ProjectStatusBadge,
  MilestoneInlineEditor,
  ActivityFeed,
} from '../components';
import { Edit, Archive, MoreVertical, Plus, Trash2 } from 'lucide-react';

export function ProjectDetail(props: { id: string; onNavigate?: (path: string) => void }) {
  const { Page, Card, Button, Input, AlertDialog } = useUi();
  const alertDialog = useAlertDialog();
  const projectId = props.id;
  const { project, loading: projectLoading, refresh: refreshProject } = useProject(projectId);
  const { milestones, loading: milestonesLoading, createMilestone, updateMilestone, deleteMilestone } =
    useProjectMilestones(projectId);
  const [activityFilter, setActivityFilter] = useState('');
  const { activity, loading: activityLoading } = useProjectActivity(projectId, activityFilter);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = () => {
    if (projectId) {
      window.location.href = `/projects/${projectId}/edit`;
    }
  };

  const handleDelete = async () => {
    if (!projectId || !project) return;
    
    const confirmed = await alertDialog.showConfirm(
      `Are you sure you want to permanently delete "${project.name}"? This action cannot be undone and will delete all project data including milestones, links, and activity.`,
      {
        variant: 'error',
        title: 'Delete Project',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    );

    if (!confirmed) return;

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
      } else {
        window.location.href = '/projects';
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      await alertDialog.showAlert(
        err instanceof Error ? err.message : 'Failed to delete project',
        {
          variant: 'error',
          title: 'Error',
        }
      );
    } finally {
      setDeleting(false);
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
  const canDelete = true; // TODO: Check actual permissions
  const canManageMilestones = true; // TODO: Check actual permissions

  const navigate = (path: string) => {
    if (props.onNavigate) {
      props.onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project.name },
  ];

  return (
    <>
      <AlertDialog {...alertDialog.props} />
      <Page
        title={project.name}
        breadcrumbs={breadcrumbs}
        onNavigate={navigate}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {canEdit && (
              <Button variant="secondary" onClick={handleEdit}>
                <Edit size={16} style={{ marginRight: '8px' }} />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                <Trash2 size={16} style={{ marginRight: '8px' }} />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        }
      >
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <ProjectStatusBadge statusId={String((project as any).statusId || '')} canChange={canEdit} />
        {project.slug && (
          <span style={{ fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)' }}>
            Slug: {project.slug}
          </span>
        )}
      </div>

      <LinkedEntityTabs
        entity={{ kind: 'project', id: projectId }}
        overview={
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
                  <ProjectStatusBadge statusId={String((project as any).statusId || '')} />
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
                    <Input placeholder="Milestone name" value={newMilestoneName} onChange={setNewMilestoneName} />
                    <Input type="date" value={newMilestoneDate} onChange={setNewMilestoneDate} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddMilestone}
                        disabled={creatingMilestone || !newMilestoneName.trim()}
                      >
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

            {/* Activity */}
            <ActivityFeed
              activities={activity}
              loading={activityLoading}
              filter={activityFilter}
              onFilterChange={setActivityFilter}
            />
          </div>
        }
        onNavigate={navigate}
      />

    </Page>
    </>
  );
}

export default ProjectDetail;
