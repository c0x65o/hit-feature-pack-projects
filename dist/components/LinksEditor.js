'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUi } from '@hit/ui-kit';
export function LinksEditor({ links, onAdd, onRemove, canManage = false }) {
    const { Card, Button, Input, TextArea, Table } = useUi();
    const [adding, setAdding] = useState(false);
    const [entityType, setEntityType] = useState('');
    const [entityId, setEntityId] = useState('');
    const [metadata, setMetadata] = useState('');
    const [loading, setLoading] = useState(false);
    const [metadataError, setMetadataError] = useState(null);
    const handleAdd = async () => {
        if (!entityType.trim() || !entityId.trim())
            return;
        let parsedMetadata;
        if (metadata.trim()) {
            try {
                parsedMetadata = JSON.parse(metadata);
                setMetadataError(null);
            }
            catch (err) {
                setMetadataError('Invalid JSON');
                return;
            }
        }
        setLoading(true);
        try {
            await onAdd({
                entityType: entityType.trim(),
                entityId: entityId.trim(),
                metadata: parsedMetadata,
            });
            setEntityType('');
            setEntityId('');
            setMetadata('');
            setAdding(false);
            setMetadataError(null);
        }
        catch (err) {
            console.error('Failed to add link:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleRemove = async (linkId) => {
        if (!confirm('Remove this link?'))
            return;
        setLoading(true);
        try {
            await onRemove(linkId);
        }
        catch (err) {
            console.error('Failed to remove link:', err);
        }
        finally {
            setLoading(false);
        }
    };
    if (links.length === 0 && !adding) {
        return (_jsxs(Card, { title: "Links", children: [_jsx("div", { style: { color: 'var(--hit-muted-foreground, #64748b)', fontSize: '14px', marginBottom: '16px' }, children: "No links added to this project." }), canManage && (_jsx(Button, { variant: "secondary", onClick: () => setAdding(true), children: "+ Add Link" }))] }));
    }
    return (_jsxs(Card, { title: "Links", children: [links.length > 0 && (_jsx(Table, { columns: [
                    { key: 'entityType', label: 'Entity Type' },
                    { key: 'entityId', label: 'Entity ID' },
                    { key: 'metadata', label: 'Metadata' },
                    ...(canManage ? [{ key: 'actions', label: '' }] : []),
                ], data: links.map((link) => ({
                    entityType: link.entityType,
                    entityId: link.entityId,
                    metadata: link.metadata ? (_jsxs("details", { children: [_jsx("summary", { style: { cursor: 'pointer', fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)' }, children: "View metadata" }), _jsx("pre", { style: {
                                    marginTop: '8px',
                                    padding: '8px',
                                    backgroundColor: 'var(--hit-muted, #f1f5f9)',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    overflow: 'auto',
                                }, children: JSON.stringify(link.metadata, null, 2) })] })) : (_jsx("span", { style: { color: 'var(--hit-muted-foreground, #64748b)', fontSize: '12px' }, children: "\u2014" })),
                    ...(canManage
                        ? [
                            {
                                actions: (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRemove(link.id), disabled: loading, children: "Remove" })),
                            },
                        ]
                        : []),
                })) })), canManage && (_jsx("div", { style: { marginTop: '16px' }, children: adding ? (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: [_jsx(Input, { label: "Entity Type", value: entityType, onChange: setEntityType, placeholder: "e.g., crm.account", disabled: loading, required: true }), _jsx(Input, { label: "Entity ID", value: entityId, onChange: setEntityId, placeholder: "Enter entity ID", disabled: loading, required: true }), _jsx(TextArea, { label: "Metadata (JSON, optional)", value: metadata, onChange: setMetadata, placeholder: '{"key": "value"}', disabled: loading, rows: 4, error: metadataError || undefined }), _jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Button, { variant: "primary", onClick: handleAdd, disabled: loading || !entityType.trim() || !entityId.trim(), children: "Add Link" }), _jsx(Button, { variant: "secondary", onClick: () => {
                                        setAdding(false);
                                        setEntityType('');
                                        setEntityId('');
                                        setMetadata('');
                                        setMetadataError(null);
                                    }, disabled: loading, children: "Cancel" })] })] })) : (_jsx(Button, { variant: "secondary", onClick: () => setAdding(true), children: "+ Add Link" })) }))] }));
}
