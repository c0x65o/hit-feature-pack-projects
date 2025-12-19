'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useUi, useAlertDialog } from '@hit/ui-kit';
import {
  useProject,
  useProjectMilestones,
  useProjectActivity,
  useProjectForms,
  useProjectFormEntries,
} from '../hooks/useProjects';
import {
  ProjectStatusBadge,
  SummaryCard,
  MilestoneInlineEditor,
  ActivityFeed,
} from '../components';
import { Edit, Archive, MoreVertical, Plus, Trash2 } from 'lucide-react';

export function ProjectDetail(props: { id?: string; onNavigate?: (path: string) => void }) {
  const { Page, Card, Button, Input, AlertDialog, Tabs, DataTable, Alert } = useUi();
  const alertDialog = useAlertDialog();
  const projectId = props.id;
  const { project, loading: projectLoading, refresh: refreshProject } = useProject(projectId);
  const { milestones, loading: milestonesLoading, createMilestone, updateMilestone, deleteMilestone } =
    useProjectMilestones(projectId);
  const [activityFilter, setActivityFilter] = useState('');
  const { activity, loading: activityLoading } = useProjectActivity(projectId, activityFilter);
  const { forms: projectForms, loading: formsLoading } = useProjectForms(projectId);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedFormId, setSelectedFormId] = useState<string | undefined>(undefined);
  const [selectedEntityFieldKey, setSelectedEntityFieldKey] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data: formEntriesData, loading: entriesLoading, refresh: refreshEntries } = useProjectFormEntries(
    projectId,
    selectedFormId,
    { page, pageSize: 25, entityFieldKey: selectedEntityFieldKey }
  );
  const [addingMilestone, setAddingMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [creatingMilestone, setCreatingMilestone] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openMilestones = useMemo(() => milestones.filter((m) => m.status !== 'completed').length, [milestones]);
  const totalMilestones = milestones.length;

  // Handle tab change - set selected form ID when a form tab is clicked
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'overview') {
      setSelectedFormId(undefined);
      setSelectedEntityFieldKey(undefined);
    } else {
      setSelectedFormId(tabId);
      // Find the form info to get the entityFieldKey
      const formInfo = projectForms.find((f) => f.formId === tabId);
      setSelectedEntityFieldKey(formInfo?.entityFieldKey);
    }
    setPage(1); // Reset to first page when switching tabs
  }, [projectForms]);

  // Build tabs array: Overview + one per form
  const tabs = useMemo(() => {
    const tabItems = [
      {
        id: 'overview',
        label: 'Overview',
        content: null, // Will be rendered separately
      },
    ];

    // Add tabs for each form with project reference field (even if count is 0)
    projectForms.forEach((form) => {
      tabItems.push({
        id: form.formId,
        label: form.count > 0 ? `${form.formName} (${form.count})` : form.formName,
        content: null, // Will be rendered separately
      });
    });

    return tabItems;
  }, [projectForms]);

  // Get current form info for selected tab
  const selectedFormInfo = useMemo(() => {
    if (!selectedFormId) return null;
    return projectForms.find((f) => f.formId === selectedFormId) || null;
  }, [selectedFormId, projectForms]);

  // Build visible fields for form entries table
  const visibleFields = useMemo(() => {
    return (formEntriesData?.fields || [])
      .filter((f: any) => !f.hidden && (f.showInTable !== false))
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
      .slice(0, 10);
  }, [formEntriesData?.fields]);

  // Build columns for form entries table
  const formEntryColumns = useMemo(() => {
    const dynamicCols = visibleFields.map((f: any) => {
      return {
        key: f.key,
        label: f.label,
        sortable: false,
        render: (_: unknown, row: any) => {
          const v = row.data?.[f.key];
          if (v === undefined || v === null) return '';
          if (f.type === 'url') {
            const s = String(v);
            if (!s.trim()) return '';
            return (
              <a className="text-sm hover:text-blue-500 underline" href={s} target="_blank" rel="noreferrer">
                {s}
              </a>
            );
          }
          if (f.type === 'datetime' || f.type === 'date') {
            try {
              const date = new Date(String(v));
              if (!isNaN(date.getTime())) {
                return f.type === 'datetime' 
                  ? date.toLocaleString()
                  : date.toLocaleDateString();
              }
            } catch {
              // Fall through to string display
            }
          }
          // Friendly display for reference fields
          if (Array.isArray(v)) {
            return v
              .map((x: any) => x?.label || x?.entryId || x?.entityId || '')
              .filter(Boolean)
              .join(', ');
          }
          if (typeof v === 'object') {
            return (v as any).label || (v as any).entryId || (v as any).entityId || '';
          }
          return String(v);
        },
      };
    });

    return [
      ...dynamicCols,
      {
        key: 'updatedAt',
        label: 'Updated',
        sortable: true,
        render: (v: unknown) => (v ? new Date(String(v)).toLocaleString() : ''),
      },
    ];
  }, [visibleFields]);

  // Build rows for form entries table
  const formEntryRows = useMemo(() => {
    return (formEntriesData?.items || []).map((e: any) => ({
      id: e.id,
      data: e.data,
      updatedAt: e.updatedAt,
    }));
  }, [formEntriesData?.items]);

  const handleEdit = () => {
    if (projectId) {
      window.location.href = `/projects/${projectId}/edit`;
    }
  };

  const handleDelete = async () => {
    if (!projectId || !project) return;
    
    const confirmed = await alertDialog.showConfirm(
      `Are you sure you want to permanently delete "${project.name}"? This action cannot be undone and will delete all project data including milestones, links, and activity.`,
      {
        variant: 'error',
        title: 'Delete Project',
        confirmText: 'Delete',
        cancelText: 'Cancel',
      }
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete project');
      }

      // Redirect to projects list after successful deletion
      if (props.onNavigate) {
        props.onNavigate('/projects');
      } else {
        window.location.href = '/projects';
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      await alertDialog.showAlert(
        err instanceof Error ? err.message : 'Failed to delete project',
        {
          variant: 'error',
          title: 'Error',
        }
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneName.trim()) return;
    setCreatingMilestone(true);
    try {
      await createMilestone({
        name: newMilestoneName.trim(),
        targetDate: newMilestoneDate || undefined,
        status: 'planned',
      });
      setNewMilestoneName('');
      setNewMilestoneDate('');
      setAddingMilestone(false);
    } catch (err) {
      console.error('Failed to create milestone:', err);
    } finally {
      setCreatingMilestone(false);
    }
  };

  if (projectLoading) {
    return (
      <Page title="Project">
        <Card>
          <div style={{ textAlign: 'center', padding: '24px' }}>Loading project...</div>
        </Card>
      </Page>
    );
  }

  if (!project) {
    return (
      <Page title="Project">
        <Card>
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-error, #ef4444)' }}>
            Project not found
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="secondary" onClick={() => (window.location.href = '/projects')}>
              Back to Projects
            </Button>
          </div>
        </Card>
      </Page>
    );
  }

  // Permission checks (these would come from your auth system)
  const canEdit = true; // TODO: Check actual permissions
  const canDelete = true; // TODO: Check actual permissions
  const canManageMilestones = true; // TODO: Check actual permissions

  const navigate = (path: string) => {
    if (props.onNavigate) {
      props.onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const breadcrumbs = [
    { label: 'Projects', href: '/projects' },
    { label: project.name },
  ];

  return (
    <>
      <AlertDialog {...alertDialog.props} />
      <Page
        title={project.name}
        breadcrumbs={breadcrumbs}
        onNavigate={navigate}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            {canEdit && (
              <Button variant="secondary" onClick={handleEdit}>
                <Edit size={16} style={{ marginRight: '8px' }} />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                <Trash2 size={16} style={{ marginRight: '8px' }} />
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        }
      >
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <ProjectStatusBadge status={(project as any).statusLabel || ''} canChange={canEdit} />
        {project.slug && (
          <span style={{ fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)' }}>
            Slug: {project.slug}
          </span>
        )}
      </div>

      {/* Tabs - Always show Overview, plus any custom form tabs */}
      {tabs.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Tabs
            tabs={tabs}
            value={activeTab}
            onValueChange={handleTabChange}
          />
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Strip - Only in Overview tab */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <SummaryCard title="Milestones" value={`${openMilestones} open`} subtitle={`${totalMilestones} total`} />
          </div>

          {/* Overview */}
          <Card title="Overview">
            {project.description ? (
              <div style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                {project.description}
              </div>
            ) : (
              <div style={{ fontSize: '14px', color: 'var(--hit-muted-foreground, #64748b)', marginBottom: '16px' }}>
                No description.
              </div>
            )}
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '12px 16px', fontSize: '14px' }}>
              <dt style={{ fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }}>Status:</dt>
              <dd>
                <ProjectStatusBadge status={(project as any).statusLabel || ''} />
              </dd>
              {project.slug && (
                <>
                  <dt style={{ fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }}>Slug:</dt>
                  <dd>{project.slug}</dd>
                </>
              )}
              <dt style={{ fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }}>Created:</dt>
              <dd>{new Date(project.createdOnTimestamp).toLocaleDateString()}</dd>
              <dt style={{ fontWeight: '500', color: 'var(--hit-muted-foreground, #64748b)' }}>Updated:</dt>
              <dd>{new Date(project.lastUpdatedOnTimestamp).toLocaleDateString()}</dd>
            </dl>
          </Card>

          {/* Milestones */}
          <Card
          title="Milestones"
          footer={
            canManageMilestones &&
            (addingMilestone ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input
                  placeholder="Milestone name"
                  value={newMilestoneName}
                  onChange={setNewMilestoneName}
                />
                <Input
                  type="date"
                  value={newMilestoneDate}
                  onChange={setNewMilestoneDate}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="primary" size="sm" onClick={handleAddMilestone} disabled={creatingMilestone || !newMilestoneName.trim()}>
                    Add Milestone
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAddingMilestone(false);
                      setNewMilestoneName('');
                      setNewMilestoneDate('');
                    }}
                    disabled={creatingMilestone}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setAddingMilestone(true)}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add Milestone
              </Button>
            ))
          }
        >
          {milestonesLoading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
              Loading milestones...
            </div>
          ) : milestones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
              No milestones yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {milestones.map((milestone) => (
                <MilestoneInlineEditor
                  key={milestone.id}
                  milestone={milestone}
                  onUpdate={updateMilestone}
                  onDelete={deleteMilestone}
                  canManage={canManageMilestones}
                />
              ))}
            </div>
          )}
        </Card>

          {/* Activity */}
          <ActivityFeed
            activities={activity}
            loading={activityLoading}
            filter={activityFilter}
            onFilterChange={setActivityFilter}
          />
        </div>
      )}

      {/* Form Entries Tab */}
      {activeTab !== 'overview' && selectedFormId && (
        <Card title={selectedFormInfo?.formName || 'Loading...'}>
          {!selectedFormInfo ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
              Loading form information...
            </div>
          ) : entriesLoading ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
              Loading entries...
            </div>
          ) : formEntriesData?.items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--hit-muted-foreground, #64748b)' }}>
              No entries found for this project.
            </div>
          ) : (
            <DataTable
              columns={formEntryColumns as any}
              data={formEntryRows}
              emptyMessage="No entries found"
              loading={entriesLoading}
              searchable
              pageSize={25}
              page={page}
              total={formEntriesData?.pagination.total}
              onPageChange={setPage}
              manualPagination
              onRefresh={refreshEntries}
              refreshing={entriesLoading}
              onRowClick={(row) => navigate(`/forms/${selectedFormId}/entries/${row.id}`)}
            />
          )}
        </Card>
      )}

    </Page>
    </>
  );
}

export default ProjectDetail;
