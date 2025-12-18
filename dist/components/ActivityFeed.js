'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
const ACTIVITY_FILTERS = [
    { value: '', label: 'All' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'group', label: 'Groups' },
    { value: 'link', label: 'Links' },
];
export function ActivityFeed({ activities, loading, filter = '', onFilterChange }) {
    const { Card, Button } = useUi();
    const [expanded, setExpanded] = useState(new Set());
    const toggleExpand = (id) => {
        const newExpanded = new Set(expanded);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        }
        else {
            newExpanded.add(id);
        }
        setExpanded(newExpanded);
    };
    const formatActivityDescription = (activity) => {
        if (activity.description)
            return activity.description;
        return `${activity.activityType} by ${activity.userId}`;
    };
    const formatTimestamp = (timestamp) => {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24)
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7)
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };
    return (_jsx(Card, { title: "Activity", footer: onFilterChange && (_jsx("div", { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' }, children: ACTIVITY_FILTERS.map((f) => (_jsx(Button, { variant: filter === f.value ? 'primary' : 'secondary', size: "sm", onClick: () => onFilterChange(f.value), children: f.label }, f.value))) })), children: loading ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Loading activity..." })) : activities.length === 0 ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "No activity yet." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: activities.map((activity) => (_jsx("div", { style: {
                    padding: '12px',
                    border: '1px solid var(--hit-border, #e2e8f0)',
                    borderRadius: '8px',
                }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: { fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: formatActivityDescription(activity) }), _jsx("div", { style: { fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)' }, children: formatTimestamp(activity.createdAt) }), expanded.has(activity.id) && activity.metadata != null && (_jsx("div", { style: {
                                        marginTop: '8px',
                                        padding: '8px',
                                        backgroundColor: 'var(--hit-muted, #f1f5f9)',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                    }, children: JSON.stringify(activity.metadata, null, 2) }))] }), activity.metadata != null && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleExpand(activity.id), children: expanded.has(activity.id) ? 'Hide' : 'Details' }))] }) }, activity.id))) })) }));
}
