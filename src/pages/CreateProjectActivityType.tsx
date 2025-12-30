'use client';

import React, { useState } from 'react';
import { useUi } from '@hit/ui-kit';
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
  const { Page, Card, Button, Input, Select, TextArea, ColorPicker } = useUi();
  const { createActivityType } = useProjectActivityTypes();
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('project');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    if (!key.trim()) {
      setError('Key is required');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Validate key format
    const keyRegex = /^[a-z0-9_]+$/;
    if (!keyRegex.test(key)) {
      setError('Key must be lowercase alphanumeric with underscores only');
      return;
    }

    setLoading(true);
    try {
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
      window.location.href = '/projects/setup/activity-types';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create activity type');
    } finally {
      setLoading(false);
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
            label="Key"
            value={key}
            onChange={handleKeyChange}
            placeholder="e.g. game_launch"
            required
            disabled={loading}
            maxLength={100}
          />
          <p style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '-12px' }}>
            Unique identifier (lowercase, alphanumeric, underscores only)
          </p>

          <Input
            label="Name"
            value={name}
            onChange={setName}
            placeholder="e.g. Game Launch"
            required
            disabled={loading}
            maxLength={255}
          />

          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={CATEGORIES}
            disabled={loading}
          />

          <TextArea
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="What this activity type represents..."
            disabled={loading}
            rows={3}
          />

          <ColorPicker
            label="Color"
            value={color}
            onChange={setColor}
            placeholder="#3b82f6"
            disabled={loading}
          />

          <Input
            label="Icon"
            value={icon}
            onChange={setIcon}
            placeholder="e.g. rocket (lucide icon name)"
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !key.trim() || !name.trim()}>
              Create Activity Type
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default CreateProjectActivityType;

