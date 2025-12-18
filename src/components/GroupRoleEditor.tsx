'use client';

import React, { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import type { ProjectGroupRole, ProjectRole } from '../schema/projects';
import { PROJECT_ROLES } from '../schema/projects';

interface GroupRoleEditorProps {
  groups: ProjectGroupRole[];
  onAdd: (groupId: string, role: ProjectRole) => Promise<void>;
  onUpdate: (groupId: string, role: ProjectRole) => Promise<void>;
  onRemove: (groupId: string) => Promise<void>;
  canManage?: boolean;
}

export function GroupRoleEditor({ groups, onAdd, onUpdate, onRemove, canManage = false }: GroupRoleEditorProps) {
  const { Card, Button, Input, Select } = useUi();
  const [adding, setAdding] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [role, setRole] = useState<ProjectRole>('contributor');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!groupId.trim()) return;
    setLoading(true);
    try {
      await onAdd(groupId.trim(), role);
      setGroupId('');
      setAdding(false);
    } catch (err) {
      // Error handling can be improved with toast notifications
      console.error('Failed to add group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (groupId: string, newRole: ProjectRole) => {
    setLoading(true);
    try {
      await onUpdate(groupId, newRole);
    } catch (err) {
      console.error('Failed to update group role:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (groupId: string) => {
    if (!confirm('Remove this group from the project?')) return;
    setLoading(true);
    try {
      await onRemove(groupId);
    } catch (err) {
      console.error('Failed to remove group:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Groups">
      {groups.length === 0 && !adding && (
        <div style={{ color: 'var(--hit-muted-foreground, #64748b)', fontSize: '14px' }}>
          No groups assigned to this project.
        </div>
      )}

      {groups.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groups.map((group) => (
            <div
              key={group.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                border: '1px solid var(--hit-border, #e2e8f0)',
                borderRadius: '8px',
              }}
            >
              <div>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>{group.groupId}</div>
                {canManage ? (
                  <Select
                    value={group.role}
                    onChange={(value) => handleUpdate(group.groupId, value as ProjectRole)}
                    options={PROJECT_ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                    disabled={loading}
                  />
                ) : (
                  <div style={{ fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '4px' }}>
                    {group.role}
                  </div>
                )}
              </div>
              {canManage && (
                <Button variant="ghost" size="sm" onClick={() => handleRemove(group.groupId)} disabled={loading}>
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div style={{ marginTop: '16px' }}>
          {adding ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                label="Group ID"
                value={groupId}
                onChange={setGroupId}
                placeholder="Enter group ID"
                disabled={loading}
              />
              <Select
                label="Role"
                value={role}
                onChange={(value) => setRole(value as ProjectRole)}
                options={PROJECT_ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                disabled={loading}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="primary" onClick={handleAdd} disabled={loading || !groupId.trim()}>
                  Add Group
                </Button>
                <Button variant="secondary" onClick={() => { setAdding(false); setGroupId(''); }} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setAdding(true)}>
              + Add Group
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

