'use client';

import React, { useState, useEffect } from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjects } from '../hooks/useProjects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
import { useAuthGroups } from '../hooks/useAuthGroups';

export function CreateProject() {
  const { Page, Card, Button, Input, TextArea, Select } = useUi();
  const { createProject } = useProjects();
  const { activeStatuses, defaultStatusKey, loading: statusesLoading } = useProjectStatuses();
  const { groups, loading: groupsLoading, error: groupsError } = useAuthGroups();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [ownerGroupId, setOwnerGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultStatusKey) {
      setStatus((s) => (s ? s : defaultStatusKey));
    }
  }, [defaultStatusKey]);

  useEffect(() => {
    if (!ownerGroupId && groups.length > 0) {
      setOwnerGroupId(groups[0].group_id);
    }
  }, [groups, ownerGroupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!ownerGroupId.trim()) {
      setError('Owner group is required');
      return;
    }

    setLoading(true);
    try {
      const project = await createProject({
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        status,
        ownerGroupId: ownerGroupId.trim(),
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

  return (
    <Page title="Create Project">
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
            value={status}
            onChange={(value) => setStatus(String(value))}
            options={activeStatuses.map((s) => ({ value: s.key, label: s.label }))}
            disabled={loading || statusesLoading}
          />

          <Select
            label="Owner Group"
            value={ownerGroupId}
            onChange={(value) => setOwnerGroupId(String(value))}
            options={groups.map((g) => ({ value: g.group_id, label: g.group_name }))}
            placeholder={groupsLoading ? 'Loading groups…' : 'Select owner group'}
            disabled={loading || groupsLoading}
          />
          {groupsError ? (
            <div style={{ fontSize: '13px', color: 'var(--hit-error, #ef4444)' }}>
              Failed to load groups from Auth. Ensure the Auth module is linked and you have permission.
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !name.trim() || !ownerGroupId.trim()}>
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </Page>
  );
}

export default CreateProject;

