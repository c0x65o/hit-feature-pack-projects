'use client';

import React from 'react';
import { useUi } from '@hit/ui-kit';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  onClick?: () => void;
}

export function SummaryCard({ title, value, subtitle, onClick }: SummaryCardProps) {
  const { Card } = useUi();

  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Card title={title}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--hit-foreground, #0f172a)' }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)' }}>{subtitle}</div>
          )}
        </div>
      </Card>
    </div>
  );
}

