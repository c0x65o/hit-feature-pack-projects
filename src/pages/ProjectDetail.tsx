'use client';

import React, { useState } from 'react';
import { useUi, useAlertDialog } from '@hit/ui-kit';
import {
  useProject,
  useProjectActivity,
  useProjectActivityTypes,
} from '../hooks/useProjects';
import { LinkedEntityTabs } from '@hit/feature-pack-form-core';
import {
  ProjectStatusBadge,
  ActivityFeed,
} from '../components';
import type { ProjectActivity } from '../schema/projects';
import { Edit, Trash2 } from 'lucide-react';

export function ProjectDetail(props: { id: string; onNavigate?: (path: string) => void }) {
  const { Page, Card, Button, Input, AlertDialog, Modal, TextArea } = useUi();
  const alertDialog = useAlertDialog();
  const projectId = props.id;
  const { project, loading: projectLoading, refresh: refreshProject } = useProject(projectId);
  const { activityTypes } = useProjectActivityTypes();
  const [activityFilter, setActivityFilter] = useState('');
  const { activity, loading: activityLoading, createActivity, updateActivity, deleteActivity } = useProjectActivity(projectId, activityFilter);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<(ProjectActivity & { activityTypeRecord?: any }) | null>(null);
  const [formTypeId, setFormTypeId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formOccurredAt, setFormOccurredAt] = useState(new Date().toISOString().slice(0, 10));
  const [creatingActivity, setCreatingActivity] = useState(false);
  const [updatingActivity, setUpdatingActivity] = useState(false);
  const [deletingActivity, setDeletingActivity] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = () => {
    if (projectId) {
      window.location.href = `/projects/${projectId}/edit`;
    }
  };

  const handleDelete = async () => {
    if (!projectId || !project) return;
    
    const confirmed = await alertDialog.showConfirm(
      `Are you sure you want to permanently delete "${project.name}"? This action cannot be undone and will delete all project data including links and activity.`,
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

  const resetForm = () => {
    setFormTypeId('');
    setFormTitle('');
    setFormDescription('');
    setFormLink('');
    setFormOccurredAt(new Date().toISOString().slice(0, 10));
    setEditingActivity(null);
  };

  const handleAddActivity = async () => {
    if (!formTypeId || !formTitle.trim()) return;
    setCreatingActivity(true);
    try {
      await createActivity({
        typeId: formTypeId,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        link: formLink.trim() || undefined,
        occurredAt: formOccurredAt || undefined,
      });
      resetForm();
      setShowAddActivityModal(false);
    } catch (err) {
      console.error('Failed to create activity:', err);
      await alertDialog.showAlert(
        err instanceof Error ? err.message : 'Failed to create activity',
        {
          variant: 'error',
          title: 'Error',
        }
      );
    } finally {
      setCreatingActivity(false);
    }
  };

  const handleEditActivity = (activity: ProjectActivity & { activityTypeRecord?: any }) => {
    setEditingActivity(activity);
    setFormTypeId(activity.typeId || '');
    setFormTitle(activity.title || '');
    setFormDescription(activity.description || '');
    setFormLink(activity.link || '');
    setFormOccurredAt(
      activity.occurredAt
        ? new Date(activity.occurredAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setShowAddActivityModal(true);
  };

  const handleUpdateActivity = async () => {
    if (!editingActivity || !formTypeId || !formTitle.trim()) return;
    setUpdatingActivity(true);
    try {
      await updateActivity(editingActivity.id, {
        typeId: formTypeId,
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        link: formLink.trim() || undefined,
        occurredAt: formOccurredAt || undefined,
      });
      resetForm();
      setShowAddActivityModal(false);
    } catch (err) {
      console.error('Failed to update activity:', err);
      await alertDialog.showAlert(
        err instanceof Error ? err.message : 'Failed to update activity',
        {
          variant: 'error',
          title: 'Error',
        }
      );
    } finally {
      setUpdatingActivity(false);
    }
  };

  const handleDeleteActivity = async (activity: ProjectActivity & { activityTypeRecord?: any }) => {
    const confirmed = await alertDialog.showConfirm(
      `Are you sure you want to delete this activity? This action cannot be undone.`,
      {
        variant: 'error',
        title: 'Delete Activity',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    );

    if (!confirmed) return;

    try {
      setDeletingActivity(true);
      await deleteActivity(activity.id);
    } catch (err) {
      console.error('Failed to delete activity:', err);
      await alertDialog.showAlert(
        err instanceof Error ? err.message : 'Failed to delete activity',
        {
          variant: 'error',
          title: 'Error',
        }
      );
    } finally {
      setDeletingActivity(false);
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

            {/* Activity */}
            <ActivityFeed
              activities={activity}
              loading={activityLoading}
              filter={activityFilter}
              onFilterChange={setActivityFilter}
              onAddActivity={canEdit ? () => {
                resetForm();
                setShowAddActivityModal(true);
              } : undefined}
              onEditActivity={canEdit ? handleEditActivity : undefined}
              onDeleteActivity={canEdit ? handleDeleteActivity : undefined}
              canEdit={canEdit}
            />
          </div>
        }
        onNavigate={navigate}
      />

      {/* Add/Edit Activity Modal */}
      <Modal
        open={showAddActivityModal}
        onClose={() => {
          resetForm();
          setShowAddActivityModal(false);
        }}
        title={editingActivity ? 'Edit Activity' : 'Add Activity'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Activity Type *
            </label>
            <select
              value={formTypeId}
              onChange={(e) => setFormTypeId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--hit-border, #e2e8f0)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              <option value="">Select type...</option>
              {activityTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Title *
            </label>
            <Input
              value={formTitle}
              onChange={setFormTitle}
              placeholder="e.g., Winter Sale 2024"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              When did this occur? *
            </label>
            <Input
              type="date"
              value={formOccurredAt}
              onChange={setFormOccurredAt}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Description
            </label>
            <TextArea
              value={formDescription}
              onChange={setFormDescription}
              placeholder="What happened?"
              rows={4}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Link (optional)
            </label>
            <Input
              value={formLink}
              onChange={setFormLink}
              placeholder="https://..."
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setShowAddActivityModal(false);
              }}
              disabled={creatingActivity || updatingActivity}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={editingActivity ? handleUpdateActivity : handleAddActivity}
              disabled={(creatingActivity || updatingActivity) || !formTypeId || !formTitle.trim()}
            >
              {creatingActivity ? 'Adding...' : updatingActivity ? 'Updating...' : editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </div>
      </Modal>

    </Page>
    </>
  );
}

export default ProjectDetail;
