'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useUi } from '@hit/ui-kit';
export function Timeline() {
    const { Page, Card } = useUi();
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load activities');
            }
            finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);
    // Group activities by year
    const activitiesByYear = useMemo(() => {
        const grouped = {};
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
    const formatDate = (date) => {
        if (!date)
            return 'Unknown';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const formatTime = (date) => {
        if (!date)
            return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };
    if (loading) {
        return (_jsx(Page, { title: "Timeline", children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px' }, children: "Loading timeline..." }) }) }));
    }
    if (error) {
        return (_jsx(Page, { title: "Timeline", children: _jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }, children: error }) }) }));
    }
    return (_jsx(Page, { title: "Timeline", children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '32px' }, children: activitiesByYear.sortedYears.length === 0 ? (_jsx(Card, { children: _jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "No activities yet." }) })) : (activitiesByYear.sortedYears.map((year) => {
                const yearActivities = activitiesByYear.grouped[year];
                return (_jsx(Card, { title: `${year}`, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: yearActivities.map((activity) => {
                            const date = activity.occurredAt ? new Date(activity.occurredAt) : new Date(activity.createdAt);
                            const typeDisplay = activity.activityTypeRecord;
                            return (_jsxs("div", { style: {
                                    padding: '16px',
                                    border: '1px solid var(--hit-border, #e2e8f0)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    gap: '16px',
                                }, children: [_jsxs("div", { style: {
                                            minWidth: '120px',
                                            fontSize: '14px',
                                            color: 'var(--hit-muted-foreground, #64748b)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }, children: [_jsx("div", { style: { fontWeight: '500' }, children: formatDate(date) }), _jsx("div", { style: { fontSize: '12px' }, children: formatTime(date) })] }), _jsxs("div", { style: { flex: 1 }, children: [typeDisplay && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }, children: [_jsx("span", { style: {
                                                            fontSize: '12px',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            backgroundColor: typeDisplay.color || '#3b82f6',
                                                            color: '#ffffff',
                                                            fontWeight: '500',
                                                        }, children: typeDisplay.name }), activity.projectName && (_jsxs("span", { style: {
                                                            fontSize: '12px',
                                                            color: 'var(--hit-muted-foreground, #64748b)',
                                                        }, children: ["\u2022 ", activity.projectName] }))] })), _jsx("div", { style: { fontSize: '16px', fontWeight: '500', marginBottom: '4px' }, children: activity.title || activity.description || activity.activityType || 'Activity' }), activity.description && activity.title && (_jsx("div", { style: {
                                                    fontSize: '14px',
                                                    color: 'var(--hit-muted-foreground, #64748b)',
                                                    marginBottom: '4px',
                                                }, children: activity.description })), activity.link && (_jsx("div", { style: { marginTop: '8px' }, children: _jsx("a", { href: activity.link, target: "_blank", rel: "noopener noreferrer", style: {
                                                        fontSize: '14px',
                                                        color: 'var(--hit-primary, #3b82f6)',
                                                        textDecoration: 'none',
                                                    }, children: activity.link }) }))] })] }, activity.id));
                        }) }) }, year));
            })) }) }));
}
export default Timeline;
