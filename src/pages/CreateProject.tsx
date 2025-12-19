'use client';

import React, { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

export function CreateProject() {
  const { Page, Card, Button, Input, TextArea, Select } = useUi();
  const { createProject } = useProjects();
  const { activeStatuses, loading: statusesLoading } = useProjectStatuses();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeStatuses.length > 0 && !statusId) {
      // Set to first active status sorted by sortOrder
      const sorted = [...activeStatuses].sort((a, b) => a.sortOrder - b.sortOrder);
      setStatusId(sorted[0].id);
    }
  }, [activeStatuses, statusId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    try {
      const project = await createProject({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        statusId,
      });
      window.location.href = `/projects/${project.data.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.href = '/projects';
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: 'Create Project' },
  ];

  return (
    <Page title="Create Project" breadcrumbs={breadcrumbs} onNavigate={navigate}>
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
            label="Project Name"
            value={name}
            onChange={setName}
            placeholder="Enter project name"
            required
            disabled={loading}
          />

          <Input
            label="Slug"
            value={slug}
            onChange={setSlug}
            placeholder="Optional - will be generated from name if omitted"
            disabled={loading}
          />

          <TextArea
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Optional description"
            rows={4}
            disabled={loading}
          />

          <Select
            label="Status"
            value={statusId}
            onChange={(value) => setStatusId(String(value))}
            options={activeStatuses.map((s) => ({ value: s.id, label: s.label }))}
            disabled={loading || statusesLoading || !activeStatuses.length}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !name.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default CreateProject;

