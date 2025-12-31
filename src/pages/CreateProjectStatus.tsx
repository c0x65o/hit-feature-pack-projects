'use client';

import React, { useState } from 'react';
import { useUi, useFormSubmit } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

export function CreateProjectStatus() {
  const { Page, Card, Button, Input, Select, ColorPicker, Alert } = useUi();
  const { createStatus } = useProjectStatuses();
  const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError } = useFormSubmit();
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('#64748b');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!label.trim()) {
      errors.label = 'Label is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await submit(async () => {
      await createStatus({
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

  const handleCancel = () => {
    window.location.href = '/projects/setup/statuses';
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: 'Setup', href: '/projects/setup/statuses' },
    { label: 'Statuses', href: '/projects/setup/statuses' },
    { label: 'Create Status' },
  ];

  return (
    <Page title="Create Status" breadcrumbs={breadcrumbs} onNavigate={navigate}>
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
            disabled={submitting}
            maxLength={50}
            error={fieldErrors.label}
          />

          <ColorPicker
            label="Color"
            value={color}
            onChange={setColor}
            placeholder="#64748b"
            disabled={submitting}
          />

          <Input
            label="Sort Order"
            value={sortOrder}
            onChange={setSortOrder}
            placeholder="0"
            disabled={submitting}
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
            disabled={submitting}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || !label.trim()}>
              {submitting ? 'Creating...' : 'Create Status'}
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default CreateProjectStatus;

