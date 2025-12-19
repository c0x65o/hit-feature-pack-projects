'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
const FALLBACK_COLORS = {
    Active: { bg: 'var(--hit-success, #22c55e)', text: '#ffffff' },
    Archived: { bg: 'var(--hit-muted, #64748b)', text: '#ffffff' },
    Completed: { bg: 'var(--hit-primary, #3b82f6)', text: '#ffffff' },
    Cancelled: { bg: 'var(--hit-error, #ef4444)', text: '#ffffff' },
    Draft: { bg: '#64748b', text: '#ffffff' },
};
function fallbackLabel(label) {
    if (!label)
        return 'Unknown';
    return label;
}
export function ProjectStatusBadge({ status, onChange, canChange = false }) {
    const { Badge, Select } = useUi();
    const { activeStatuses } = useProjectStatuses();
    const record = activeStatuses.find((s) => s.label === status);
    const label = record?.label || fallbackLabel(String(status));
    const colors = record?.color
        ? { bg: record.color, text: '#ffffff' }
        : (FALLBACK_COLORS[String(status)] || { bg: 'var(--hit-muted, #64748b)', text: '#ffffff' });
    if (canChange && onChange) {
        return (_jsx(Select, { value: String(status), onChange: (value) => onChange(String(value)), options: activeStatuses.map((s) => ({ value: s.label, label: s.label })) }));
    }
    return (_jsx(Badge, { style: {
            backgroundColor: colors.bg,
            color: colors.text,
        }, children: label }));
}
