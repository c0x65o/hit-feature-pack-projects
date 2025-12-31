'use client';

import React, { useState, useEffect } from 'react';
import { useUi, useAlertDialog, useFormSubmit } from '@hit/ui-kit';
import { useProjectActivityType } from '../hooks/useProjectActivityTypes';
import { Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'project', label: 'Project' },
  { value: 'release', label: 'Release' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ops', label: 'Operations' },
  { value: 'content', label: 'Content' },
  { value: 'other', label: 'Other' },
];

export function EditProjectActivityType(props: { id?: string }) {
  const { Page, Card, Button, Input, Select, TextArea, AlertDialog, ColorPicker, Alert } = useUi();
  const alertDialog = useAlertDialog();
  const activityTypeId = props.id;
  const { activityType, loading: activityTypeLoading, updateActivityType, deleteActivityType } =
    useProjectActivityType(activityTypeId);
  const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError, setError } = useFormSubmit();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('project');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (activityType) {
      setName(activityType.name);
      setCategory(activityType.category || 'project');
      setDescription(activityType.description || '');
      setColor(activityType.color || '#3b82f6');
      setIcon(activityType.icon || '');
      setSortOrder(String(activityType.sortOrder || 0));
      setIsActive(activityType.isActive);
    }
  }, [activityType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTypeId) return;

    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await submit(async () => {
      await updateActivityType({
        name: name.trim(),
        category: category || null,
        description: description.trim() || null,
        color: color.trim() || null,
        icon: icon.trim() || null,
        sortOrder: Number(sortOrder || 0),
        isActive,
      });
      return { success: true };
    });

    if (result) {
      window.location.href = '/projects/setup/activity-types';
    }
  };

  const handleDelete = async () => {
    if (!activityTypeId || !activityType) return;

    const confirmed = await alertDialog.showConfirm(
      `Are you sure you want to delete "${activityType.name}"? This cannot be undone.`,
      {
        variant: 'error',
        title: 'Delete Activity Type',
        confirmText: 'Delete',
      }
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteActivityType();
      window.location.href = '/projects/setup/activity-types';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity type');
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/projects/setup/activity-types';
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const breadcrumbs = activityType
    ? [
        { label: 'Projects', href: '/projects' },
        { label: 'Setup', href: '/projects/setup/activity-types' },
        { label: 'Activity Types', href: '/projects/setup/activity-types' },
        { label: activityType.name },
      ]
    : [
        { label: 'Projects', href: '/projects' },
        { label: 'Setup', href: '/projects/setup/activity-types' },
        { label: 'Activity Types', href: '/projects/setup/activity-types' },
        { label: 'Activity Type' },
      ];

  if (activityTypeLoading) {
    return (
      <Page title="Edit Activity Type" breadcrumbs={breadcrumbs} onNavigate={navigate}>
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading activity type...</div>
        </Card>
      </Page>
    );
  }

  if (!activityType) {
    return (
      <Page title="Edit Activity Type" breadcrumbs={breadcrumbs} onNavigate={navigate}>
        <Card>
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }}>
            Activity type not found
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => (window.location.href = '/projects/setup/activity-types')}>
              Back to Activity Types
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <>
      <AlertDialog {...alertDialog.props} />
      <Page title="Edit Activity Type" breadcrumbs={breadcrumbs} onNavigate={navigate}>
        <Card>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && (
              <Alert variant="error" title="Error" onClose={clearError}>
                {error.message}
              </Alert>
            )}

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--hit-muted-foreground, #64748b)',
                  marginBottom: '6px',
                }}
              >
                Key (read-only)
              </label>
              <Input value={activityType.key} disabled={true} onChange={() => {}} />
              <p style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '4px' }}>
                Key cannot be changed after creation
              </p>
            </div>

            <Input
              label="Name"
              value={name}
              onChange={(v: string) => { setName(v); clearFieldError('name'); }}
              placeholder="e.g. Game Launch"
              required
              disabled={submitting || deleting}
              maxLength={255}
              error={fieldErrors.name}
            />

            <Select
              label="Category"
              value={category}
              onChange={setCategory}
              options={CATEGORIES}
              disabled={submitting || deleting}
            />

            <TextArea
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="What this activity type represents..."
              disabled={submitting || deleting}
              rows={3}
            />

            <ColorPicker
              label="Color"
              value={color}
              onChange={setColor}
              placeholder="#3b82f6"
              disabled={submitting || deleting}
            />

            <Input
              label="Icon"
              value={icon}
              onChange={setIcon}
              placeholder="e.g. rocket (lucide icon name)"
              disabled={submitting || deleting}
              maxLength={100}
            />
            <p style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '-12px' }}>
              Lucide icon name (optional)
            </p>

            <Input
              label="Sort Order"
              value={sortOrder}
              onChange={setSortOrder}
              placeholder="0"
              disabled={submitting || deleting}
              type="number"
            />

            <Select
              label="Active?"
              value={isActive ? 'yes' : 'no'}
              onChange={(v: string | number) => setIsActive(String(v) === 'yes')}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
              disabled={submitting || deleting || activityType.isSystem}
            />
            {activityType.isSystem && (
              <p style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '-12px' }}>
                System activity types cannot be deactivated
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }}>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                disabled={submitting || deleting || activityType.isSystem}
              >
                <Trash2 size={16} style={{ marginRight: '8px' }} />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
              {activityType.isSystem && (
                <p style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', alignSelf: 'center' }}>
                  System activity types cannot be deleted
                </p>
              )}
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button type="button" variant="secondary" onClick={handleCancel} disabled={submitting || deleting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting || deleting || !name.trim()}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </Page>
    </>
  );
}

export default EditProjectActivityType;

