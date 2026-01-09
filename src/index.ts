// @hit/feature-pack-projects
// A HIT feature pack

// Pages - exported individually for tree-shaking
export { Dashboard } from './pages/Dashboard';
export { ProjectDetail } from './pages/ProjectDetail';
export { CreateProject } from './pages/CreateProject';
export { EditProject } from './pages/EditProject';
export { ProjectStatusesSetup } from './pages/ProjectStatusesSetup';
export { CreateProjectStatus } from './pages/CreateProjectStatus';
export { EditProjectStatus } from './pages/EditProjectStatus';
export { ProjectActivityTypesSetup } from './pages/ProjectActivityTypesSetup';
export { CreateProjectActivityType } from './pages/CreateProjectActivityType';
export { EditProjectActivityType } from './pages/EditProjectActivityType';
export { Timeline } from './pages/Timeline';

// Schema exports MOVED to @hit/feature-pack-projects/schema to avoid bundling drizzle-orm in client
// Only re-export types (no runtime drizzle dependency) - re-export is done in schema/index.ts

// Components - exported individually for tree-shaking
export { ProjectStatusBadge } from './components/ProjectStatusBadge';
export { SummaryCard } from './components/SummaryCard';
export { ActivityFeed } from './components/ActivityFeed';

// Hooks - exported individually for tree-shaking
export { useProjects, useProject, useProjectActivityTypes, useProjectLinks, useProjectActivity } from './hooks/useProjects';
export type { ProjectFormInfo, FormEntryRecord, PaginatedFormEntriesResponse } from './hooks/useProjects';
export { useProjectStatuses, useProjectStatus } from './hooks/useProjectStatuses';
export { ProjectStatusesProvider, useProjectStatusesContext } from './hooks/ProjectStatusesContext';
export type { ProjectStatusesContextValue } from './hooks/ProjectStatusesContext';
