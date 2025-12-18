'use client';

import React, { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import type { ProjectActivity } from '../schema/projects';

interface ActivityFeedProps {
  activities: ProjectActivity[];
  loading?: boolean;
  filter?: string;
  onFilterChange?: (filter: string) => void;
}

const ACTIVITY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'milestone', label: 'Milestones' },
  { value: 'group', label: 'Groups' },
  { value: 'link', label: 'Links' },
];

export function ActivityFeed({ activities, loading, filter = '', onFilterChange }: ActivityFeedProps) {
  const { Card, Button } = useUi();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const formatActivityDescription = (activity: ProjectActivity): string => {
    if (activity.description) return activity.description;
    return `${activity.activityType} by ${activity.userId}`;
  };

  const formatTimestamp = (timestamp: string | Date): string => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card
      title="Activity"
      footer={
        onFilterChange && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ACTIVITY_FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onFilterChange(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        )
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
          Loading activity...
        </div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
          No activity yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                padding: '12px',
                border: '1px solid var(--hit-border, #e2e8f0)',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    {formatActivityDescription(activity)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)' }}>
                    {formatTimestamp(activity.createdAt)}
                  </div>
                  {expanded.has(activity.id) && activity.metadata != null && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: 'var(--hit-muted, #f1f5f9)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    >
                      {JSON.stringify(activity.metadata as any, null, 2)}
                    </div>
                  )}
                </div>
                {activity.metadata != null && (
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(activity.id)}>
                    {expanded.has(activity.id) ? 'Hide' : 'Details'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

