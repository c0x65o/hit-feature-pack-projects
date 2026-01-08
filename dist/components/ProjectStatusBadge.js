'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useUi } from '@hit/ui-kit';
import { useProjectStatuses } from '../hooks/useProjectStatuses';
export function ProjectStatusBadge({ statusId, onChange, canChange = false }) {
    const { Badge, Select } = useUi();
    const { activeStatuses } = useProjectStatuses();
    const record = activeStatuses.find((s) => s.id === statusId) || null;
    const label = record?.label || 'Unknown';
    const colors = record?.color ? { bg: record.color, text: '#ffffff' } : { bg: 'var(--hit-muted, #64748b)', text: '#ffffff' };
    if (canChange && onChange) {
        return (_jsx(Select, { value: String(statusId), onChange: (value) => onChange(String(value)), options: activeStatuses.map((s) => ({ value: s.id, label: s.label })) }));
    }
    return (_jsx(Badge, { style: {
            backgroundColor: colors.bg,
            color: colors.text,
        }, children: label }));
}
