'use client';

import React, { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import type { ProjectMilestone, MilestoneStatus } from '../schema/projects';
import { MILESTONE_STATUSES } from '../schema/projects';

interface MilestoneInlineEditorProps {
  milestone: ProjectMilestone;
  onUpdate: (id: string, updates: Partial<ProjectMilestone>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canManage?: boolean;
}

export function MilestoneInlineEditor({ milestone, onUpdate, onDelete, canManage = false }: MilestoneInlineEditorProps) {
  const { Button, Input, TextArea, Select } = useUi();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(milestone.name);
  const [description, setDescription] = useState(milestone.description || '');
  const [targetDate, setTargetDate] = useState(
    milestone.targetDate ? new Date(milestone.targetDate).toISOString().split('T')[0] : ''
  );
  const [status, setStatus] = useState<MilestoneStatus>(milestone.status as MilestoneStatus);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(milestone.id, {
        name,
        description: description || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        status,
      });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update milestone:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this milestone?')) return;
    setLoading(true);
    try {
      await onDelete(milestone.id);
    } catch (err) {
      console.error('Failed to delete milestone:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = async () => {
    setLoading(true);
    try {
      await onUpdate(milestone.id, { status: 'completed', completedDate: new Date() });
    } catch (err) {
      console.error('Failed to mark milestone as done:', err);
    } finally {
      setLoading(false);
    }
  };

  if (editing && canManage) {
    return (
      <div
        style={{
          padding: '16px',
          border: '1px solid var(--hit-border, #e2e8f0)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <Input label="Name" value={name} onChange={setName} disabled={loading} required />
        <TextArea label="Description" value={description} onChange={setDescription} disabled={loading} rows={3} />
        <Input
          label="Target Date"
          type="date"
          value={targetDate}
          onChange={setTargetDate}
          disabled={loading}
        />
        <Select
          label="Status"
          value={status}
          onChange={(value) => setStatus(value as MilestoneStatus)}
          options={MILESTONE_STATUSES.map((s) => ({
            value: s,
            label: s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '),
          }))}
          disabled={loading}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="primary" onClick={handleSave} disabled={loading || !name.trim()}>
            Save
          </Button>
          <Button variant="secondary" onClick={() => { setEditing(false); setName(milestone.name); }} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const isCompleted = milestone.status === 'completed';
  const isOverdue = milestone.targetDate && new Date(milestone.targetDate) < new Date() && !isCompleted;

  return (
    <div
      style={{
        padding: '12px',
        border: '1px solid var(--hit-border, #e2e8f0)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontWeight: '500', fontSize: '14px' }}>{milestone.name}</span>
          <span
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: isCompleted
                ? 'var(--hit-success, #22c55e)'
                : isOverdue
                ? 'var(--hit-error, #ef4444)'
                : 'var(--hit-muted, #64748b)',
              color: '#ffffff',
            }}
          >
            {milestone.status}
          </span>
        </div>
        {milestone.description && (
          <div style={{ fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '4px' }}>
            {milestone.description}
          </div>
        )}
        {milestone.targetDate && (
          <div style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)' }}>
            Due: {new Date(milestone.targetDate).toLocaleDateString()}
          </div>
        )}
      </div>
      {canManage && (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {!isCompleted && (
            <Button variant="ghost" size="sm" onClick={handleMarkDone} disabled={loading}>
              Mark Done
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} disabled={loading}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}

