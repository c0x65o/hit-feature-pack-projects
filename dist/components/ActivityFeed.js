'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { Plus, Edit, Trash2 } from 'lucide-react';
export function ActivityFeed({ activities, loading, filter = '', onFilterChange, onAddActivity, onEditActivity, onDeleteActivity, canEdit = false }) {
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
        // User-created activity with type
        if (activity.title) {
            return activity.title;
        }
        // System activity
        if (activity.description)
            return activity.description;
        return `${activity.activityType || 'Activity'} by ${activity.userId}`;
    };
    const getActivityTypeDisplay = (activity) => {
        if (activity.activityTypeRecord) {
            return {
                name: activity.activityTypeRecord.name,
                color: activity.activityTypeRecord.color || '#3b82f6',
            };
        }
        return null;
    };
    const formatTimestamp = (timestamp) => {
        if (!timestamp)
            return 'Unknown';
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
    return (_jsx(Card, { title: "Activity", footer: _jsx("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: onAddActivity && (_jsxs(Button, { variant: "primary", size: "sm", onClick: onAddActivity, children: [_jsx(Plus, { size: 16, style: { marginRight: '8px' } }), "Add Activity"] })) }), children: loading ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "Loading activity..." })) : activities.length === 0 ? (_jsx("div", { style: { textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "No activity yet." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: activities.map((activity) => {
                const typeDisplay = getActivityTypeDisplay(activity);
                const timestamp = activity.occurredAt || activity.createdAt;
                return (_jsx("div", { style: {
                        padding: '12px',
                        border: '1px solid var(--hit-border, #e2e8f0)',
                        borderRadius: '8px',
                    }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }, children: [_jsxs("div", { style: { flex: 1 }, children: [typeDisplay && (_jsx("div", { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }, children: _jsx("span", { style: {
                                                fontSize: '12px',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: typeDisplay.color,
                                                color: '#ffffff',
                                                fontWeight: '500',
                                            }, children: typeDisplay.name }) })), _jsx("div", { style: { fontSize: '14px', fontWeight: '500', marginBottom: '4px' }, children: formatActivityDescription(activity) }), activity.description && (_jsx("div", { style: { fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '4px' }, children: activity.description })), activity.link && (_jsx("div", { style: { marginBottom: '4px' }, children: _jsx("a", { href: activity.link, target: "_blank", rel: "noopener noreferrer", style: { fontSize: '13px', color: 'var(--hit-primary, #3b82f6)', textDecoration: 'none' }, children: activity.link }) })), _jsx("div", { style: { fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)' }, children: formatTimestamp(timestamp) }), expanded.has(activity.id) && activity.metadata != null && (_jsx("div", { style: {
                                            marginTop: '8px',
                                            padding: '8px',
                                            backgroundColor: 'var(--hit-muted, #f1f5f9)',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontFamily: 'monospace',
                                        }, children: JSON.stringify(activity.metadata, null, 2) }))] }), _jsxs("div", { style: { display: 'flex', gap: '8px', alignItems: 'center' }, children: [activity.metadata != null && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => toggleExpand(activity.id), children: expanded.has(activity.id) ? 'Hide' : 'Details' })), canEdit && activity.typeId && onEditActivity && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => onEditActivity(activity), title: "Edit activity", children: _jsx(Edit, { size: 16 }) })), canEdit && activity.typeId && onDeleteActivity && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => onDeleteActivity(activity), title: "Delete activity", children: _jsx(Trash2, { size: 16 }) }))] })] }) }, activity.id));
            }) })) }));
}
