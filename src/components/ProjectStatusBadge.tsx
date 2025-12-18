'use client';

import React from 'react';
import { useUi } from '@hit/ui-kit';
import type { ProjectStatus } from '../schema/projects';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  onChange?: (newStatus: ProjectStatus) => void;
  canChange?: boolean;
}

const FALLBACK_COLORS: Record<string, { bg: string; text: string }> = {
  active: { bg: 'var(--hit-success, #22c55e)', text: '#ffffff' },
  archived: { bg: 'var(--hit-muted, #64748b)', text: '#ffffff' },
  completed: { bg: 'var(--hit-primary, #3b82f6)', text: '#ffffff' },
  cancelled: { bg: 'var(--hit-error, #ef4444)', text: '#ffffff' },
  draft: { bg: '#64748b', text: '#ffffff' },
};

function fallbackLabel(key: string): string {
  if (!key) return 'Unknown';
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ProjectStatusBadge({ status, onChange, canChange = false }: ProjectStatusBadgeProps) {
  const { Badge, Select } = useUi();
  const { activeStatuses } = useProjectStatuses();

  const record = activeStatuses.find((s) => s.key === status);
  const label = record?.label || fallbackLabel(String(status));
  const colors = record?.color
    ? { bg: record.color, text: '#ffffff' }
    : (FALLBACK_COLORS[String(status)] || { bg: 'var(--hit-muted, #64748b)', text: '#ffffff' });

  if (canChange && onChange) {
    return (
      <Select
        value={String(status)}
        onChange={(value) => onChange(String(value))}
        options={activeStatuses.map((s) => ({ value: s.key, label: s.label }))}
      />
    );
  }

  return (
    <Badge
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {label}
    </Badge>
  );
}

