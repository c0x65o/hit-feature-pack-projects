'use client';

import React, { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import type { ProjectActivity } from '../schema/projects';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface ActivityFeedProps {
  activities: ProjectActivity[];
  loading?: boolean;
  filter?: string;
  onFilterChange?: (filter: string) => void;
  onAddActivity?: () => void;
  onEditActivity?: (activity: ProjectActivity & { activityTypeRecord?: any }) => void;
  onDeleteActivity?: (activity: ProjectActivity & { activityTypeRecord?: any }) => void;
  canEdit?: boolean;
}

export function ActivityFeed({ activities, loading, filter = '', onFilterChange, onAddActivity, onEditActivity, onDeleteActivity, canEdit = false }: ActivityFeedProps) {
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

  const formatActivityDescription = (activity: ProjectActivity & { activityTypeRecord?: any }): string => {
    // User-created activity with type
    if (activity.title) {
      return activity.title;
    }
    // System activity
    if (activity.description) return activity.description;
    return `${activity.activityType || 'Activity'} by ${activity.userId}`;
  };

  const getActivityTypeDisplay = (activity: ProjectActivity & { activityTypeRecord?: any }) => {
    if (activity.activityTypeRecord) {
      return {
        name: activity.activityTypeRecord.name,
        color: activity.activityTypeRecord.color || '#3b82f6',
      };
    }
    return null;
  };

  const formatTimestamp = (timestamp: string | Date | null | undefined): string => {
    if (!timestamp) return 'Unknown';
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {onAddActivity && (
            <Button variant="primary" size="sm" onClick={onAddActivity}>
              <Plus size={16} style={{ marginRight: '8px' }} />
              Add Activity
            </Button>
          )}
        </div>
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
          {activities.map((activity: any) => {
            const typeDisplay = getActivityTypeDisplay(activity);
            const timestamp = activity.occurredAt || activity.createdAt;
            return (
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
                    {typeDisplay && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: typeDisplay.color,
                            color: '#ffffff',
                            fontWeight: '500',
                          }}
                        >
                          {typeDisplay.name}
                        </span>
                      </div>
                    )}
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      {formatActivityDescription(activity)}
                    </div>
                    {activity.description && (
                      <div style={{ fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '4px' }}>
                        {activity.description}
                      </div>
                    )}
                    {activity.link && (
                      <div style={{ marginBottom: '4px' }}>
                        <a
                          href={activity.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '13px', color: 'var(--hit-primary, #3b82f6)', textDecoration: 'none' }}
                        >
                          {activity.link}
                        </a>
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)' }}>
                      {formatTimestamp(timestamp)}
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
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {activity.metadata != null && (
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(activity.id)}>
                        {expanded.has(activity.id) ? 'Hide' : 'Details'}
                      </Button>
                    )}
                    {canEdit && activity.typeId && onEditActivity && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditActivity(activity)}
                        title="Edit activity"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                    {canEdit && activity.typeId && onDeleteActivity && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteActivity(activity)}
                        title="Delete activity"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

