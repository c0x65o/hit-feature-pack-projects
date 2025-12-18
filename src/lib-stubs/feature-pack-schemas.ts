/**
 * Stub for @/lib/feature-pack-schemas
 * 
 * This is a type-only stub for feature pack compilation.
 * At runtime, the consuming application provides the actual implementation
 * via the generated lib/feature-pack-schemas.ts file.
 */

// Re-export schema tables from this feature pack
export {
  projects,
  projectStatuses,
  projectGroupRoles,
  projectMilestones,
  projectLinks,
  projectActivity,
  projectNotes,
  Project,
  ProjectStatusRecord,
  ProjectGroupRole,
  ProjectMilestone,
  ProjectLink,
  ProjectActivity,
  ProjectNote,
  InsertProject,
  InsertProjectStatus,
  InsertProjectGroupRole,
  InsertProjectMilestone,
  InsertProjectLink,
  InsertProjectActivity,
  InsertProjectNote,
  PROJECT_ROLES,
  DEFAULT_PROJECT_STATUS_KEYS,
  MILESTONE_STATUSES,
  ACTIVITY_TYPES,
  type ProjectRole,
  type ProjectStatus,
  type DefaultProjectStatusKey,
  type MilestoneStatus,
  type ActivityType,
} from '../schema/projects';
