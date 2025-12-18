'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import { PROJECT_ROLES } from '../schema/projects';
export function GroupRoleEditor({ groups, onAdd, onUpdate, onRemove, canManage = false }) {
    const { Card, Button, Input, Select } = useUi();
    const [adding, setAdding] = useState(false);
    const [groupId, setGroupId] = useState('');
    const [role, setRole] = useState('contributor');
    const [loading, setLoading] = useState(false);
    const handleAdd = async () => {
        if (!groupId.trim())
            return;
        setLoading(true);
        try {
            await onAdd(groupId.trim(), role);
            setGroupId('');
            setAdding(false);
        }
        catch (err) {
            // Error handling can be improved with toast notifications
            console.error('Failed to add group:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleUpdate = async (groupId, newRole) => {
        setLoading(true);
        try {
            await onUpdate(groupId, newRole);
        }
        catch (err) {
            console.error('Failed to update group role:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemove = async (groupId) => {
        if (!confirm('Remove this group from the project?'))
            return;
        setLoading(true);
        try {
            await onRemove(groupId);
        }
        catch (err) {
            console.error('Failed to remove group:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Card, { title: "Groups", children: [groups.length === 0 && !adding && (_jsx("div", { style: { color: 'var(--hit-muted-foreground, #64748b)', fontSize: '14px' }, children: "No groups assigned to this project." })), groups.length > 0 && (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: groups.map((group) => (_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        border: '1px solid var(--hit-border, #e2e8f0)',
                        borderRadius: '8px',
                    }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: '500', fontSize: '14px' }, children: group.groupId }), canManage ? (_jsx(Select, { value: group.role, onChange: (value) => handleUpdate(group.groupId, value), options: PROJECT_ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })), disabled: loading })) : (_jsx("div", { style: { fontSize: '13px', color: 'var(--hit-muted-foreground, #64748b)', marginTop: '4px' }, children: group.role }))] }), canManage && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRemove(group.groupId), disabled: loading, children: "Remove" }))] }, group.id))) })), canManage && (_jsx("div", { style: { marginTop: '16px' }, children: adding ? (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx(Input, { label: "Group ID", value: groupId, onChange: setGroupId, placeholder: "Enter group ID", disabled: loading }), _jsx(Select, { label: "Role", value: role, onChange: (value) => setRole(value), options: PROJECT_ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })), disabled: loading }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Button, { variant: "primary", onClick: handleAdd, disabled: loading || !groupId.trim(), children: "Add Group" }), _jsx(Button, { variant: "secondary", onClick: () => { setAdding(false); setGroupId(''); }, disabled: loading, children: "Cancel" })] })] })) : (_jsx(Button, { variant: "secondary", onClick: () => setAdding(true), children: "+ Add Group" })) }))] }));
}
