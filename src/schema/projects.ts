/**
 * Projects Feature Pack Schema
 *
 * Drizzle table definitions for the Projects feature pack.
 * This schema gets merged into the project's database.
 *
 * Core entities:
 * - projects: Main project records
 * - project_milestones: Project milestones/goals
 * - project_links: Generic links to other entities (no cross-pack FKs)
 * - project_activity: Audit trail for project changes
 *
 * All tables include standard audit fields:
 * - created_by_user_id (user who created the record)
 * - created_on_timestamp (when record was created)
 * - last_updated_by_user_id (user who last updated the record)
 * - last_updated_on_timestamp (when record was last updated)
 */

import {
  pgTable,
  varchar,
  text,
  timestamp,
  uuid,
  jsonb,
  index,
  unique,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

/**
 * Projects Table
 * Stores project records - domain-agnostic execution containers
 */
export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }), // URL-friendly identifier
    description: text('description'),
    status: varchar('status', { length: 50 }).default('active').notNull(), // active, archived, completed, cancelled
    // CRM Company association (optional, controlled by feature flag)
    companyId: uuid('company_id'), // References crm_companies.id when CRM is enabled
    // Audit fields
    createdByUserId: varchar('created_by_user_id', { length: 255 }).notNull(),
    createdOnTimestamp: timestamp('created_on_timestamp').defaultNow().notNull(),
    lastUpdatedByUserId: varchar('last_updated_by_user_id', { length: 255 }),
    lastUpdatedOnTimestamp: timestamp('last_updated_on_timestamp').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: unique('projects_slug_unique').on(table.slug),
    statusIdx: index('projects_status_idx').on(table.status),
    createdByIdx: index('projects_created_by_idx').on(table.createdByUserId),
    companyIdx: index('projects_company_idx').on(table.companyId),
  })
);

/**
 * Project Statuses Table (setup-controlled)
 * Defines allowed project statuses and their display metadata.
 *
 * Seeded by migrations, then fully manageable via Setup UI.
 */
export const projectStatuses = pgTable(
  'project_statuses',
  {
    key: varchar('key', { length: 50 }).primaryKey(), // e.g. draft, active, archived
    label: varchar('label', { length: 100 }).notNull(), // e.g. "Active"
    color: varchar('color', { length: 50 }), // e.g. "green" or "#22c55e"
    sortOrder: integer('sort_order').default(0).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sortIdx: index('project_statuses_sort_idx').on(table.sortOrder),
    activeIdx: index('project_statuses_active_idx').on(table.isActive),
    defaultIdx: index('project_statuses_default_idx').on(table.isDefault),
  })
);

/**
 * Project Milestones Table
 * Stores project milestones/goals with target dates
 */
export const projectMilestones = pgTable(
  'project_milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    targetDate: timestamp('target_date'),
    completedDate: timestamp('completed_date'),
    status: varchar('status', { length: 50 }).default('planned').notNull(), // planned, in_progress, completed, cancelled
    // Audit fields
    createdByUserId: varchar('created_by_user_id', { length: 255 }).notNull(),
    createdOnTimestamp: timestamp('created_on_timestamp').defaultNow().notNull(),
    lastUpdatedByUserId: varchar('last_updated_by_user_id', { length: 255 }),
    lastUpdatedOnTimestamp: timestamp('last_updated_on_timestamp').defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index('project_milestones_project_idx').on(table.projectId),
    statusIdx: index('project_milestones_status_idx').on(table.status),
    targetDateIdx: index('project_milestones_target_date_idx').on(table.targetDate),
  })
);

/**
 * Project Links Table
 * Generic linking table for references to other systems/entities
 * Uses entity_type + entity_id pattern (no cross-pack foreign keys)
 * Examples: crm_account, marketing_plan, metrics_data_source, vault_item, location, task_query
 */
export const projectLinks = pgTable(
  'project_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(), // e.g., "crm.account", "marketing.plan", "metrics.data_source"
    entityId: varchar('entity_id', { length: 255 }).notNull(), // Opaque string reference (no FK)
    metadata: jsonb('metadata'), // Additional context/metadata about the link
    // Audit fields
    createdByUserId: varchar('created_by_user_id', { length: 255 }).notNull(),
    createdOnTimestamp: timestamp('created_on_timestamp').defaultNow().notNull(),
    lastUpdatedByUserId: varchar('last_updated_by_user_id', { length: 255 }),
    lastUpdatedOnTimestamp: timestamp('last_updated_on_timestamp').defaultNow().notNull(),
  },
  (table) => ({
    projectEntityIdx: unique('project_links_project_entity_unique').on(
      table.projectId,
      table.entityType,
      table.entityId
    ),
    projectIdx: index('project_links_project_idx').on(table.projectId),
    entityTypeIdx: index('project_links_entity_type_idx').on(table.entityType),
    entityIdx: index('project_links_entity_idx').on(table.entityId),
  })
);

/**
 * Project Activity Table
 * Audit trail for project changes and events
 * Records: project.created, project.updated, project.status_changed,
 *          project.link_added, project.link_removed,
 *          project.milestone_created, project.milestone_updated
 */
export const projectActivity = pgTable(
  'project_activity',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    activityType: varchar('activity_type', { length: 100 }).notNull(), // project.created, project.updated, etc.
    userId: varchar('user_id', { length: 255 }).notNull(), // User who performed the action
    description: text('description'), // Human-readable description
    metadata: jsonb('metadata'), // Additional context (before/after values, etc.)
    createdAt: timestamp('created_at').defaultNow().notNull(), // When the activity occurred
  },
  (table) => ({
    projectIdx: index('project_activity_project_idx').on(table.projectId),
    activityTypeIdx: index('project_activity_activity_type_idx').on(table.activityType),
    userIdx: index('project_activity_user_idx').on(table.userId),
    createdAtIdx: index('project_activity_created_at_idx').on(table.createdAt),
  })
);

/**
 * Project Notes Table (optional)
 * Stores notes/comments associated with projects
 */
export const projectNotes = pgTable(
  'project_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    content: text('content').notNull(),
    // Audit fields
    createdByUserId: varchar('created_by_user_id', { length: 255 }).notNull(),
    createdOnTimestamp: timestamp('created_on_timestamp').defaultNow().notNull(),
    lastUpdatedByUserId: varchar('last_updated_by_user_id', { length: 255 }),
    lastUpdatedOnTimestamp: timestamp('last_updated_on_timestamp').defaultNow().notNull(),
  },
  (table) => ({
    projectIdx: index('project_notes_project_idx').on(table.projectId),
    createdByIdx: index('project_notes_created_by_idx').on(table.createdByUserId),
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const projectsRelations = relations(projects, ({ many }) => ({
  milestones: many(projectMilestones),
  links: many(projectLinks),
  activity: many(projectActivity),
  notes: many(projectNotes),
}));

export const projectMilestonesRelations = relations(projectMilestones, ({ one }) => ({
  project: one(projects, {
    fields: [projectMilestones.projectId],
    references: [projects.id],
  }),
}));

export const projectLinksRelations = relations(projectLinks, ({ one }) => ({
  project: one(projects, {
    fields: [projectLinks.projectId],
    references: [projects.id],
  }),
}));

export const projectActivityRelations = relations(projectActivity, ({ one }) => ({
  project: one(projects, {
    fields: [projectActivity.projectId],
    references: [projects.id],
  }),
}));

export const projectNotesRelations = relations(projectNotes, ({ one }) => ({
  project: one(projects, {
    fields: [projectNotes.projectId],
    references: [projects.id],
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// TYPES - Export for use in handlers and components
// ─────────────────────────────────────────────────────────────────────────────

export type Project = InferSelectModel<typeof projects>;
export type ProjectStatusRecord = InferSelectModel<typeof projectStatuses>;
export type ProjectMilestone = InferSelectModel<typeof projectMilestones>;
export type ProjectLink = InferSelectModel<typeof projectLinks>;
export type ProjectActivity = InferSelectModel<typeof projectActivity>;
export type ProjectNote = InferSelectModel<typeof projectNotes>;

export type InsertProject = InferInsertModel<typeof projects>;
export type InsertProjectStatus = InferInsertModel<typeof projectStatuses>;
export type InsertProjectMilestone = InferInsertModel<typeof projectMilestones>;
export type InsertProjectLink = InferInsertModel<typeof projectLinks>;
export type InsertProjectActivity = InferInsertModel<typeof projectActivity>;
export type InsertProjectNote = InferInsertModel<typeof projectNotes>;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────


/**
 * ProjectStatus is setup-controlled and therefore not a fixed union.
 * Keep this as a string to avoid drift between UI/constants and DB.
 */
export type ProjectStatus = string;

/**
 * Defaults inserted by migrations (safe baseline).
 */
export const DEFAULT_PROJECT_STATUS_KEYS = ['draft', 'active', 'completed', 'cancelled', 'archived'] as const;
export type DefaultProjectStatusKey = (typeof DEFAULT_PROJECT_STATUS_KEYS)[number];

export const MILESTONE_STATUSES = ['planned', 'in_progress', 'completed', 'cancelled'] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const ACTIVITY_TYPES = [
  'project.created',
  'project.updated',
  'project.status_changed',
  'project.link_added',
  'project.link_removed',
  'project.link_updated',
  'project.milestone_created',
  'project.milestone_updated',
  'project.milestone_completed',
  'project.milestone_deleted',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
