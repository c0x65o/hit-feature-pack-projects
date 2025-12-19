'use client';

import React from 'react';
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';

interface ProjectStatusBadgeProps {
  statusId: string;
  onChange?: (newStatusId: string) => void;
  canChange?: boolean;
}

export function ProjectStatusBadge({ statusId, onChange, canChange = false }: ProjectStatusBadgeProps) {
  const { Badge, Select } = useUi();
  const { activeStatuses } = useProjectStatuses();

  const record = activeStatuses.find((s) => s.id === statusId) || null;
  const label = record?.label || 'Unknown';
  const colors = record?.color ? { bg: record.color, text: '#ffffff' } : { bg: 'var(--hit-muted, #64748b)', text: '#ffffff' };

  if (canChange && onChange) {
    return (
      <Select
        value={String(statusId)}
        onChange={(value) => onChange(String(value))}
        options={activeStatuses.map((s) => ({ value: s.id, label: s.label }))}
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

