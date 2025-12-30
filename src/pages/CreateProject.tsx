'use client';

import React, { useState, useEffect } from 'react';
import { useUi, useFormSubmit } from '@hit/ui-kit';
import { useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

export function CreateProject() {
  const { Page, Card, Button, Input, TextArea, Select, Alert } = useUi();
  const { createProject } = useProjects();
  const { activeStatuses, loading: statusesLoading } = useProjectStatuses();
  const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError } = useFormSubmit<{ id: string }>();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<string>('');

  useEffect(() => {
    if (activeStatuses.length > 0 && !statusId) {
      // Set to first active status sorted by sortOrder
      const sorted = [...activeStatuses].sort((a, b) => a.sortOrder - b.sortOrder);
      setStatusId(sorted[0].id);
    }
  }, [activeStatuses, statusId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Project name is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await submit(async () => {
      const project = await createProject({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        statusId,
      });
      return { id: project.data.id };
    });

    if (result) {
      window.location.href = `/projects/${result.id}`;
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
            <Alert variant="error" title="Error" onClose={clearError}>
              {error.message}
            </Alert>
          )}

          <Input
            label="Project Name"
            value={name}
            onChange={(v) => { setName(v); clearFieldError('name'); }}
            placeholder="Enter project name"
            required
            disabled={submitting}
            error={fieldErrors.name}
          />

          <Input
            label="Slug"
            value={slug}
            onChange={setSlug}
            placeholder="Optional - will be generated from name if omitted"
            disabled={submitting}
          />

          <TextArea
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Optional description"
            rows={4}
            disabled={submitting}
          />

          <Select
            label="Status"
            value={statusId}
            onChange={(value: string | number) => setStatusId(String(value))}
            options={activeStatuses.map((s) => ({ value: s.id, label: s.label }))}
            disabled={submitting || statusesLoading || !activeStatuses.length}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting || !name.trim()}>
              {submitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default CreateProject;

