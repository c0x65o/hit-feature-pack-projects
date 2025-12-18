/**
 * Stub for @/lib/feature-pack-schemas
 *
 * This is a type-only stub for feature pack compilation.
 * At runtime, the consuming application provides the actual implementation
 * via the generated lib/feature-pack-schemas.ts file.
 */
// Re-export schema tables from this feature pack
export { projects, projectStatuses, projectMilestones, projectLinks, projectActivity, projectNotes, DEFAULT_PROJECT_STATUS_KEYS, MILESTONE_STATUSES, ACTIVITY_TYPES, } from '../schema/projects';
