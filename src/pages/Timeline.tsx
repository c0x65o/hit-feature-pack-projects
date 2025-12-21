'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
import type { ProjectActivity } from '../schema/projects';

interface ActivityWithType extends ProjectActivity {
  projectName?: string;
  activityTypeRecord?: {
    id: string;
    key: string;
    name: string;
    category: string | null;
    color: string | null;
    icon: string | null;
  } | null;
}

export function Timeline() {
  const { Page, Card } = useUi();
  const [activities, setActivities] = useState<ActivityWithType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/projects/activity/all');
        if (!res.ok) {
          throw new Error('Failed to fetch activities');
        }
        const json = await res.json();
        setActivities(json.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Group activities by year
  const activitiesByYear = useMemo(() => {
    const grouped: Record<number, ActivityWithType[]> = {};

    activities.forEach((activity) => {
      const date = activity.occurredAt ? new Date(activity.occurredAt) : new Date(activity.createdAt);
      const year = date.getFullYear();

      if (!grouped[year]) {
        grouped[year] = [];
      }
      grouped[year].push(activity);
    });

    // Sort years descending
    const sortedYears = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a);

    return { grouped, sortedYears };
  }, [activities]);

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Unknown';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string | Date | null | undefined): string => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Page title="Timeline">
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading timeline...</div>
        </Card>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="Timeline">
        <Card>
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }}>
            {error}
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page title="Timeline">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {activitiesByYear.sortedYears.length === 0 ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
              No activities yet.
            </div>
          </Card>
        ) : (
          activitiesByYear.sortedYears.map((year) => {
            const yearActivities = activitiesByYear.grouped[year];
            return (
              <Card key={year} title={`${year}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {yearActivities.map((activity) => {
                    const date = activity.occurredAt ? new Date(activity.occurredAt) : new Date(activity.createdAt);
                    const typeDisplay = activity.activityTypeRecord;

                    return (
                      <div
                        key={activity.id}
                        style={{
                          padding: '16px',
                          border: '1px solid var(--hit-border, #e2e8f0)',
                          borderRadius: '8px',
                          display: 'flex',
                          gap: '16px',
                        }}
                      >
                        <div
                          style={{
                            minWidth: '120px',
                            fontSize: '14px',
                            color: 'var(--hit-muted-foreground, #64748b)',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <div style={{ fontWeight: '500' }}>{formatDate(date)}</div>
                          <div style={{ fontSize: '12px' }}>{formatTime(date)}</div>
                        </div>

                        <div style={{ flex: 1 }}>
                          {typeDisplay && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <span
                                style={{
                                  fontSize: '12px',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: typeDisplay.color || '#3b82f6',
                                  color: '#ffffff',
                                  fontWeight: '500',
                                }}
                              >
                                {typeDisplay.name}
                              </span>
                              {activity.projectName && (
                                <span
                                  style={{
                                    fontSize: '12px',
                                    color: 'var(--hit-muted-foreground, #64748b)',
                                  }}
                                >
                                  • {activity.projectName}
                                </span>
                              )}
                            </div>
                          )}

                          <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
                            {activity.title || activity.description || activity.activityType || 'Activity'}
                          </div>

                          {activity.description && activity.title && (
                            <div
                              style={{
                                fontSize: '14px',
                                color: 'var(--hit-muted-foreground, #64748b)',
                                marginBottom: '4px',
                              }}
                            >
                              {activity.description}
                            </div>
                          )}

                          {activity.link && (
                            <div style={{ marginTop: '8px' }}>
                              <a
                                href={activity.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: '14px',
                                  color: 'var(--hit-primary, #3b82f6)',
                                  textDecoration: 'none',
                                }}
                              >
                                {activity.link}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Page>
  );
}

export default Timeline;

