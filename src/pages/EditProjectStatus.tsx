'use client';

import React, { useState, useEffect } from 'react';
import { useUi, useAlertDialog } from '@hit/ui-kit';
import { useProjectStatus } from '../hooks/useProjectStatuses';
import { Trash2 } from 'lucide-react';

export function EditProjectStatus(props: { id?: string }) {
  const { Page, Card, Button, Input, Select } = useUi();
  const alertDialog = useAlertDialog();
  const statusId = props.id;
  const { status, loading: statusLoading, updateStatus, deleteStatus } = useProjectStatus(statusId);

  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#64748b');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    setError(null);
    if (!label.trim()) {
      setError('Label is required');
      return;
    }

    setLoading(true);
    try {
      await updateStatus({
        label: label.trim(),
        color: color.trim() || null,
        sortOrder: Number(sortOrder || 0),
        isActive,
      });
      window.location.href = '/projects/setup/statuses';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setLoading(false);
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
        { label: status.label, href: `/projects/setup/statuses/${statusId}` },
        { label: 'Edit' },
      ]
    : [
        { label: 'Projects', href: '/projects' },
        { label: 'Setup', href: '/projects/setup/statuses' },
        { label: 'Statuses', href: '/projects/setup/statuses' },
        { label: 'Edit Status' },
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
    <Page title="Edit Status" breadcrumbs={breadcrumbs} onNavigate={navigate}>
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--hit-error-light, rgba(239, 68, 68, 0.1))',
                border: '1px solid var(--hit-error, #ef4444)',
                borderRadius: '8px',
                color: 'var(--hit-error, #ef4444)',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <Input
            label="Label"
            value={label}
            onChange={setLabel}
            placeholder="e.g. Active"
            required
            disabled={loading || deleting}
            maxLength={50}
          />

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
              Color
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={loading || deleting}
                style={{
                  width: '60px',
                  height: '40px',
                  padding: '2px',
                  backgroundColor: 'var(--hit-input-bg, #ffffff)',
                  border: '1px solid var(--hit-border-default, #cbd5e1)',
                  borderRadius: '6px',
                  cursor: loading || deleting ? 'not-allowed' : 'pointer',
                  opacity: loading || deleting ? 0.5 : 1,
                }}
              />
              <Input
                value={color}
                onChange={setColor}
                placeholder="#64748b"
                disabled={loading || deleting}
                className="flex-1"
              />
            </div>
          </div>

          <Input
            label="Sort Order"
            value={sortOrder}
            onChange={setSortOrder}
            placeholder="0"
            disabled={loading || deleting}
            type="number"
          />

          <Select
            label="Active?"
            value={isActive ? 'yes' : 'no'}
            onChange={(v) => setIsActive(String(v) === 'yes')}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
            disabled={loading || deleting}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '8px' }}>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={loading || deleting}>
              <Trash2 size={16} style={{ marginRight: '8px' }} />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading || deleting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading || deleting || !label.trim()}>
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default EditProjectStatus;
