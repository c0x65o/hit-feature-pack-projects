// @hit/feature-pack-projects
// A HIT feature pack
export * from './pages';
// Schema exports MOVED to @hit/feature-pack-projects/schema to avoid bundling drizzle-orm in client
// Only re-export types (no runtime drizzle dependency) - re-export is done in schema/index.ts
export * from './components';
export * from './hooks/useProjects';
export * from './hooks/useProjectStatuses';
export * from './hooks/ProjectStatusesContext';
