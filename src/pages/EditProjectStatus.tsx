'use client';

import React, { useState, useEffect } from 'react';
import { useUi, useAlertDialog, useFormSubmit } from '@hit/ui-kit';
import { useProjectStatus } from '../hooks/useProjectStatuses';
import { Trash2 } from 'lucide-react';

export function EditProjectStatus(props: { id?: string }) {
  const { Page, Card, Button, Input, Select, AlertDialog, ColorPicker, Alert } = useUi();
  const alertDialog = useAlertDialog();
  const statusId = props.id;
  const { status, loading: statusLoading, updateStatus, deleteStatus } = useProjectStatus(statusId);
  const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError, setError } = useFormSubmit();

  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#64748b');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status) {
      setLabel(status.label);
      setColor(status.color || '#64748b');
      setSortOrder(String(status.sortOrder || 0));
      setIsActive(status.isActive);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusId) return;

    const errors: Record<string, string> = {};
    if (!label.trim()) {
      errors.label = 'Label is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await submit(async () => {
      await updateStatus({
        label: label.trim(),
        color: color.trim() || null,
        sortOrder: Number(sortOrder || 0),
        isActive,
      });
      return { success: true };
    });

    if (result) {
      window.location.href = '/projects/setup/statuses';
    }
  };

  const handleDelete = async () => {
    if (!statusId || !status) return;

    const confirmed = await alertDialog.showConfirm(
      `Are you sure you want to delete "${status.label}"? This cannot be undone.`,
      {
        variant: 'error',
        title: 'Delete Status',
        confirmText: 'Delete',
      }
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteStatus();
      window.location.href = '/projects/setup/statuses';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete status');
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/projects/setup/statuses';
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const breadcrumbs = status
    ? [
        { label: 'Projects', href: '/projects' },
        { label: 'Setup', href: '/projects/setup/statuses' },
        { label: 'Statuses', href: '/projects/setup/statuses' },
        { label: status.label },
      ]
    : [
        { label: 'Projects', href: '/projects' },
        { label: 'Setup', href: '/projects/setup/statuses' },
        { label: 'Statuses', href: '/projects/setup/statuses' },
        { label: 'Status' },
      ];

  if (statusLoading) {
    return (
      <Page title="Edit Status" breadcrumbs={breadcrumbs} onNavigate={navigate}>
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading status...</div>
        </Card>
      </Page>
    );
  }

  if (!status) {
    return (
      <Page title="Edit Status" breadcrumbs={breadcrumbs} onNavigate={navigate}>
        <Card>
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }}>
            Status not found
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => (window.location.href = '/projects/setup/statuses')}>
              Back to Statuses
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <>
      <AlertDialog {...alertDialog.props} />
      <Page title="Edit Status" breadcrumbs={breadcrumbs} onNavigate={navigate}>
        <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <Alert variant="error" title="Error" onClose={clearError}>
              {error.message}
            </Alert>
          )}

          <Input
            label="Label"
            value={label}
            onChange={(v: string) => { setLabel(v); clearFieldError('label'); }}
            placeholder="e.g. Active"
            required
            disabled={submitting || deleting}
            maxLength={50}
            error={fieldErrors.label}
          />

          <ColorPicker
            label="Color"
            value={color}
            onChange={setColor}
            placeholder="#64748b"
            disabled={submitting || deleting}
          />

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
            disabled={submitting || deleting}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }}>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={submitting || deleting}>
              <Trash2 size={16} style={{ marginRight: '8px' }} />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={submitting || deleting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting || deleting || !label.trim()}>
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

export default EditProjectStatus;
