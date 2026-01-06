'use client';

import React, { useState } from 'react';
import { useUi } from '@hit/ui-kit';
import type { ProjectLink } from '../schema/projects';

interface LinksEditorProps {
  links: ProjectLink[];
  onAdd: (link: { entityType: string; entityId: string; metadata?: Record<string, unknown> }) => Promise<void>;
  onRemove: (linkId: string) => Promise<void>;
  canManage?: boolean;
}

export function LinksEditor({ links, onAdd, onRemove, canManage = false }: LinksEditorProps) {
  const { Card, Button, Input, TextArea, Table } = useUi();
  const [adding, setAdding] = useState(false);
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!entityType.trim() || !entityId.trim()) return;

    let parsedMetadata: Record<string, unknown> | undefined;
    if (metadata.trim()) {
      try {
        parsedMetadata = JSON.parse(metadata);
        setMetadataError(null);
      } catch (err) {
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
    } catch (err) {
      console.error('Failed to add link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (linkId: string) => {
    if (!confirm('Remove this link?')) return;
    setLoading(true);
    try {
      await onRemove(linkId);
    } catch (err) {
      console.error('Failed to remove link:', err);
    } finally {
      setLoading(false);
    }
  };

  if (links.length === 0 && !adding) {
    return (
      <Card title="Links">
        <div style={{ color: 'var(--hit-muted-foreground, #64748b)', fontSize: '14px', marginBottom: '16px' }}>
          No links added to this project.
        </div>
        {canManage && (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            + Add Link
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card title="Links">
      {links.length > 0 && (
        <Table
          columns={[
            { key: 'entityType', label: 'Entity Type' },
            { key: 'entityId', label: 'Entity ID' },
            { key: 'metadata', label: 'Metadata' },
            ...(canManage ? [{ key: 'actions', label: '', hideable: false }] : []),
          ]}
          data={links.map((link) => ({
            entityType: link.entityType,
            entityId: link.entityId,
            metadata: link.metadata ? (
              <details>
                <summary style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--hit-muted-foreground, #64748b)' }}>
                  View metadata
                </summary>
                <pre
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: 'var(--hit-muted, #f1f5f9)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    overflow: 'auto',
                  }}
                >
                  {JSON.stringify(link.metadata, null, 2)}
                </pre>
              </details>
            ) : (
              <span style={{ color: 'var(--hit-muted-foreground, #64748b)', fontSize: '12px' }}>—</span>
            ),
            ...(canManage
              ? [
                  {
                    actions: (
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(link.id)} disabled={loading}>
                        Remove
                      </Button>
                    ),
                  },
                ]
              : []),
          }))}
        />
      )}

      {canManage && (
        <div style={{ marginTop: '16px' }}>
          {adding ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input
                label="Entity Type"
                value={entityType}
                onChange={setEntityType}
                placeholder="e.g., crm.account"
                disabled={loading}
                required
              />
              <Input
                label="Entity ID"
                value={entityId}
                onChange={setEntityId}
                placeholder="Enter entity ID"
                disabled={loading}
                required
              />
              <TextArea
                label="Metadata (JSON, optional)"
                value={metadata}
                onChange={setMetadata}
                placeholder='{"key": "value"}'
                disabled={loading}
                rows={4}
                error={metadataError || undefined}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  onClick={handleAdd}
                  disabled={loading || !entityType.trim() || !entityId.trim()}
                >
                  Add Link
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAdding(false);
                    setEntityType('');
                    setEntityId('');
                    setMetadata('');
                    setMetadataError(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setAdding(true)}>
              + Add Link
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

