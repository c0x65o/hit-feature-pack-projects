'use client';

import React, { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProject, useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

export function EditProject(props: { id?: string }) {
  const { Page, Card, Button, Input, TextArea, Select } = useUi();
  const projectId = props.id;
  const { project, loading: projectLoading } = useProject(projectId);
  const { updateProject } = useProjects();
  const { activeStatuses, loading: statusesLoading } = useProjectStatuses();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setSlug(project.slug || '');
      setDescription(project.description || '');
      setStatus(String(project.status || 'active'));
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setError(null);
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    try {
      await updateProject(projectId, {
        name: name.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
        status,
      });
      window.location.href = `/projects/${projectId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setLoading(false);
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
            placeholder="URL-friendly identifier"
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
            value={status}
            onChange={(value) => setStatus(String(value))}
            options={activeStatuses.map((s) => ({ value: s.key, label: s.label }))}
            disabled={loading || statusesLoading}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !name.trim()}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default EditProject;

