'use client';

import React, { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { useFormSubmit } from '@hit/ui-kit/hooks/useFormSubmit';
import { useProjectActivityTypes } from '../hooks/useProjectActivityTypes';

const CATEGORIES = [
  { value: 'project', label: 'Project' },
  { value: 'release', label: 'Release' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ops', label: 'Operations' },
  { value: 'content', label: 'Content' },
  { value: 'other', label: 'Other' },
];

export function CreateProjectActivityType() {
  const { Page, Card, Button, Input, Select, TextArea, ColorPicker, Alert } = useUi();
  const { createActivityType } = useProjectActivityTypes();
  const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError } = useFormSubmit();
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('project');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const handleKeyChange = (value: string) => {
    // Auto-format key: lowercase, alphanumeric + underscores only
    const formatted = value
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
    setKey(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!key.trim()) {
      errors.key = 'Key is required';
    }
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    // Validate key format
    const keyRegex = /^[a-z0-9_]+$/;
    if (key.trim() && !keyRegex.test(key)) {
      errors.key = 'Key must be lowercase alphanumeric with underscores only';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await submit(async () => {
      await createActivityType({
        key: key.trim(),
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

  const handleCancel = () => {
    window.location.href = '/projects/setup/activity-types';
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: 'Setup', href: '/projects/setup/activity-types' },
    { label: 'Activity Types', href: '/projects/setup/activity-types' },
    { label: 'Create Activity Type' },
  ];

  return (
    <Page title="Create Activity Type" breadcrumbs={breadcrumbs} onNavigate={navigate}>
      <Card>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <Alert variant="error" title="Error" onClose={clearError}>
              {error.message}
            </Alert>
          )}

          <Input
            label="Key"
            value={key}
            onChange={(v: string) => { handleKeyChange(v); clearFieldError('key'); }}
            placeholder="e.g. game_launch"
            required
            disabled={submitting}
            maxLength={100}
            error={fieldErrors.key}
          />
          <p style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '-12px' }}>
            Unique identifier (lowercase, alphanumeric, underscores only)
          </p>

          <Input
            label="Name"
            value={name}
            onChange={(v: string) => { setName(v); clearFieldError('name'); }}
            placeholder="e.g. Game Launch"
            required
            disabled={submitting}
            maxLength={255}
            error={fieldErrors.name}
          />

          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={CATEGORIES}
            disabled={submitting}
          />

          <TextArea
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What this activity type represents..."
            disabled={submitting}
            rows={3}
          />

          <ColorPicker
            label="Color"
            value={color}
            onChange={setColor}
            placeholder="#3b82f6"
            disabled={submitting}
          />

          <Input
            label="Icon"
            value={icon}
            onChange={setIcon}
            placeholder="e.g. rocket (lucide icon name)"
            disabled={submitting}
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
            <Button type="submit" variant="primary" disabled={submitting || !key.trim() || !name.trim()}>
              {submitting ? 'Creating...' : 'Create Activity Type'}
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default CreateProjectActivityType;

