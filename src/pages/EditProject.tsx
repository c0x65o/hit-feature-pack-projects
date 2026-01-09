'use client';

import React, { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useFormSubmit } from '@hit/ui-kit/hooks/useFormSubmit';
import { useProject, useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

export function EditProject(props: { id: string }) {
  const { Page, Card, Button, Input, TextArea, Select, Alert } = useUi();
  const projectId = props.id;
  const { project, loading: projectLoading } = useProject(projectId);
  const { updateProject } = useProjects();
  const { activeStatuses, loading: statusesLoading } = useProjectStatuses();
  const { submitting, error, fieldErrors, submit, clearError, setFieldErrors, clearFieldError } = useFormSubmit();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [statusId, setStatusId] = useState<string>('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug || '');
      setDescription(project.description || '');
      setStatusId(String((project as any).statusId || ''));
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    const errors: Record<string, string> = {};
    if (!name.trim()) {
      errors.name = 'Project name is required';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const result = await submit(async () => {
      await updateProject(projectId, {
        name: name.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
        statusId,
      } as any);
      return { id: projectId };
    });

    if (result) {
      window.location.href = `/projects/${projectId}`;
    }
  };

  const handleCancel = () => {
    if (projectId) {
      window.location.href = `/projects/${projectId}`;
    } else {
      window.location.href = '/projects';
    }
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const breadcrumbs = project
    ? [
        { label: 'Projects', href: '/projects' },
        { label: project.name, href: `/projects/${projectId}` },
        { label: 'Edit' },
      ]
    : [
        { label: 'Projects', href: '/projects' },
        { label: 'Edit Project' },
      ];

  if (projectLoading) {
    return (
      <Page title="Edit Project" breadcrumbs={breadcrumbs} onNavigate={navigate}>
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading project...</div>
        </Card>
      </Page>
    );
  }

  if (!project) {
    return (
      <Page title="Edit Project" breadcrumbs={breadcrumbs} onNavigate={navigate}>
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

  return (
    <Page title="Edit Project" breadcrumbs={breadcrumbs} onNavigate={navigate}>
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
            onChange={(v: string) => { setName(v); clearFieldError('name'); }}
            placeholder="Enter project name"
            required
            disabled={submitting}
            error={fieldErrors.name}
          />

          <Input
            label="Slug"
            value={slug}
            onChange={setSlug}
            placeholder="URL-friendly identifier"
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default EditProject;

