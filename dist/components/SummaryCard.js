'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUi } from '@hit/ui-kit';
export function SummaryCard({ title, value, subtitle, onClick }) {
    const { Card } = useUi();
    return (_jsx("div", { onClick: onClick, style: {
            cursor: onClick ? 'pointer' : 'default',
        }, children: _jsx(Card, { title: title, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '4px' }, children: [_jsx("div", { style: { fontSize: '24px', fontWeight: '600', color: 'var(--hit-foreground, #0f172a)' }, children: value }), subtitle && (_jsx("div", { style: { fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)' }, children: subtitle }))] }) }) }));
}
