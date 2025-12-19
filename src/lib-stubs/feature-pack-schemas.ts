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
  projectMilestones,
  projectLinks,
  projectActivity,
  projectNotes,
  Project,
  ProjectStatusRecord,
  ProjectMilestone,
  ProjectLink,
  ProjectActivity,
  ProjectNote,
  InsertProject,
  InsertProjectStatus,
  InsertProjectMilestone,
  InsertProjectLink,
  InsertProjectActivity,
  InsertProjectNote,
  DEFAULT_PROJECT_STATUS_LABELS,
  MILESTONE_STATUSES,
  ACTIVITY_TYPES,
  type ProjectStatus,
  type DefaultProjectStatusLabel,
  type MilestoneStatus,
  type ActivityType,
} from '../schema/projects';
