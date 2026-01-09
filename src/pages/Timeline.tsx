'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useUi } from '@hit/ui-kit';
import { useAlertDialog } from '@hit/ui-kit/hooks/useAlertDialog';
import { useProjectActivityTypes } from '../hooks/useProjectActivityTypes';
import type { ProjectActivity, Project } from '../schema/projects';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ActivityWithType extends ProjectActivity {
  projectName?: string;
  activityTypeRecord?: {
    id: string;
    key: string;
    name: string;
    category: string | null;
    color: string | null;
    icon: string | null;
  } | null;
}

export function Timeline() {
  const { Page, Card, Button, Input, Modal, TextArea, AlertDialog } = useUi();
  const alertDialog = useAlertDialog();
  const { activityTypes } = useProjectActivityTypes();
  
  const [activities, setActivities] = useState<ActivityWithType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityWithType | null>(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
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
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
    fetchProjects();
  }, [fetchActivities, fetchProjects]);

  // Group activities by year
  const activitiesByYear = useMemo(() => {
    const grouped: Record<number, ActivityWithType[]> = {};

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

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Unknown';
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

  const handleEditActivity = (activity: ActivityWithType) => {
    setEditingActivity(activity);
    setFormProjectId(activity.projectId);
    setFormTypeId(activity.typeId || '');
    setFormTitle(activity.title || '');
    setFormDescription(activity.description || '');
    setFormLink(activity.link || '');
    setFormOccurredAt(
      activity.occurredAt
        ? new Date(activity.occurredAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    setShowActivityModal(true);
  };

  const handleSaveActivity = async () => {
    const projectId = editingActivity ? editingActivity.projectId : formProjectId;
    if (!projectId || !formTypeId || !formTitle.trim()) return;
    
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
      } else {
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
    } catch (err) {
      console.error('Failed to save activity:', err);
      await alertDialog.showAlert(
        err instanceof Error ? err.message : 'Failed to save activity',
        { variant: 'error', title: 'Error' }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async (activity: ActivityWithType) => {
    const confirmed = await alertDialog.showConfirm(
      'Are you sure you want to delete this activity? This action cannot be undone.',
      {
        variant: 'error',
        title: 'Delete Activity',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/projects/${activity.projectId}/activity/${activity.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Failed to delete activity');
      }
      await fetchActivities();
    } catch (err) {
      console.error('Failed to delete activity:', err);
      await alertDialog.showAlert(
        err instanceof Error ? err.message : 'Failed to delete activity',
        { variant: 'error', title: 'Error' }
      );
    }
  };

  if (loading) {
    return (
      <Page title="Timeline">
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading timeline...</div>
        </Card>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Timeline">
        <Card>
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }}>
            {error}
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <>
      <AlertDialog {...alertDialog.props} />
      <Page
        title="Timeline"
        actions={
          <Button variant="primary" onClick={handleAddActivity}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Add Activity
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {activitiesByYear.sortedYears.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
                No activities yet.
              </div>
            </Card>
          ) : (
            activitiesByYear.sortedYears.map((year) => {
              const yearActivities = activitiesByYear.grouped[year];
              return (
                <Card key={year} title={`${year}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {yearActivities.map((activity) => {
                      const date = activity.occurredAt ? new Date(activity.occurredAt) : new Date(activity.createdAt);
                      const typeDisplay = activity.activityTypeRecord;

                      return (
                        <div
                          key={activity.id}
                          style={{
                            padding: '16px',
                            border: '1px solid var(--hit-border, #e2e8f0)',
                            borderRadius: '8px',
                            display: 'flex',
                            gap: '16px',
                          }}
                        >
                          <div
                            style={{
                              minWidth: '120px',
                              fontSize: '14px',
                              color: 'var(--hit-muted-foreground, #64748b)',
                              fontWeight: '500',
                            }}
                          >
                            {formatDate(date)}
                          </div>

                          <div style={{ flex: 1 }}>
                            {typeDisplay && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span
                                  style={{
                                    fontSize: '12px',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: typeDisplay.color || '#3b82f6',
                                    color: '#ffffff',
                                    fontWeight: '500',
                                  }}
                                >
                                  {typeDisplay.name}
                                </span>
                                {activity.projectName && (
                                  <span
                                    style={{
                                      fontSize: '12px',
                                      color: 'var(--hit-muted-foreground, #64748b)',
                                    }}
                                  >
                                    • {activity.projectName}
                                  </span>
                                )}
                              </div>
                            )}

                            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                              {activity.title || activity.description || activity.activityType || 'Activity'}
                            </div>

                            {activity.description && activity.title && (
                              <div
                                style={{
                                  fontSize: '14px',
                                  color: 'var(--hit-muted-foreground, #64748b)',
                                  marginBottom: '4px',
                                }}
                              >
                                {activity.description}
                              </div>
                            )}

                            {activity.link && (
                              <div style={{ marginTop: '8px' }}>
                                <a
                                  href={activity.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '14px',
                                    color: 'var(--hit-primary, #3b82f6)',
                                    textDecoration: 'none',
                                  }}
                                >
                                  {activity.link}
                                </a>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-start' }}>
                            <button
                              onClick={() => handleEditActivity(activity)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: 'var(--hit-muted-foreground, #64748b)',
                              }}
                              title="Edit activity"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(activity)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                color: 'var(--hit-error, #ef4444)',
                              }}
                              title="Delete activity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Page>

      {/* Add/Edit Activity Modal */}
      <Modal
        open={showActivityModal}
        onClose={() => {
          resetForm();
          setShowActivityModal(false);
        }}
        title={editingActivity ? 'Edit Activity' : 'Add Activity'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!editingActivity && (
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                Project *
              </label>
              <select
                value={formProjectId}
                onChange={(e) => setFormProjectId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--hit-border, #e2e8f0)',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                setShowActivityModal(false);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveActivity}
              disabled={saving || !formTypeId || !formTitle.trim() || (!editingActivity && !formProjectId)}
            >
              {saving ? 'Saving...' : editingActivity ? 'Update Activity' : 'Add Activity'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Timeline;
