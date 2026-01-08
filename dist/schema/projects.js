/**
 * Projects Feature Pack Schema
 *
 * Drizzle table definitions for the Projects feature pack.
 * This schema gets merged into the project's database.
 *
 * Core entities:
 * - projects: Main project records
 * - project_activity_types: Activity type definitions (setup-controlled)
 * - project_links: Generic links to other entities (no cross-pack FKs)
 * - project_activity: Audit trail for project changes
 *
 * All tables include standard audit fields:
 * - created_by_user_id (user who created the record)
 * - created_on_timestamp (when record was created)
 * - last_updated_by_user_id (user who last updated the record)
 * - last_updated_on_timestamp (when record was last updated)
 */
import { pgTable, varchar, text, timestamp, uuid, jsonb, index, unique, boolean, integer, } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
/**
 * Projects Table
 * Stores project records - domain-agnostic execution containers
 */
export const projects = pgTable('projects', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }), // URL-friendly identifier
    description: text('description'),
    statusId: uuid('status_id')
        .references(() => projectStatuses.id)
        .notNull(), // FK to project_statuses
    // CRM Company association (optional, controlled by feature flag)
    companyId: uuid('company_id'), // References crm_companies.id when CRM is enabled
    // Audit fields
    createdByUserId: varchar('created_by_user_id', { length: 255 }).notNull(),
    createdOnTimestamp: timestamp('created_on_timestamp').defaultNow().notNull(),
    lastUpdatedByUserId: varchar('last_updated_by_user_id', { length: 255 }),
    lastUpdatedOnTimestamp: timestamp('last_updated_on_timestamp').defaultNow().notNull(),
}, (table) => ({
    slugIdx: unique('projects_slug_unique').on(table.slug),
    statusIdx: index('projects_status_id_idx').on(table.statusId),
    createdByIdx: index('projects_created_by_idx').on(table.createdByUserId),
    companyIdx: index('projects_company_idx').on(table.companyId),
}));
/**
 * Project Statuses Table (setup-controlled)
 * Defines allowed project statuses and their display metadata.
 *
 * Seeded by migrations, then fully manageable via Setup UI.
 */
export const projectStatuses = pgTable('project_statuses', {
    id: uuid('id').primaryKey().defaultRandom(),
    label: varchar('label', { length: 50 }).notNull().unique(), // e.g. "Active" - display label (projects reference by id, not label)
    color: varchar('color', { length: 50 }), // e.g. "green" or "#22c55e"
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    sortIdx: index('project_statuses_sort_idx').on(table.sortOrder),
    activeIdx: index('project_statuses_active_idx').on(table.isActive),
}));
/**
 * Project Activity Types Table (setup-controlled)
 * Defines activity types that can be used when creating activities
 * Similar to marketing activity types, but for projects
 */
export const projectActivityTypes = pgTable('project_activity_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).notNull(), // e.g., "game_launch", "sale", "update"
    name: varchar('name', { length: 255 }).notNull(), // Display label
    category: varchar('category', { length: 50 }), // project, release, ops, content, other
    description: text('description'),
    color: varchar('color', { length: 50 }), // Badge/timeline color
    icon: varchar('icon', { length: 100 }), // Icon name (lucide)
    sortOrder: integer('sort_order').default(0).notNull(),
    isSystem: boolean('is_system').notNull().default(false), // Prevent deleting seeded types
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    keyIdx: unique('project_activity_types_key_unique').on(table.key),
    sortIdx: index('project_activity_types_sort_idx').on(table.sortOrder),
    activeIdx: index('project_activity_types_active_idx').on(table.isActive),
}));
/**
 * Project Links Table
 * Generic linking table for references to other systems/entities
 * Uses entity_type + entity_id pattern (no cross-pack foreign keys)
 * Examples: crm_account, marketing_plan, metrics_data_source, vault_item, location, task_query
 */
export const projectLinks = pgTable('project_links', {
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
}, (table) => ({
    projectEntityIdx: unique('project_links_project_entity_unique').on(table.projectId, table.entityType, table.entityId),
    projectIdx: index('project_links_project_idx').on(table.projectId),
    entityTypeIdx: index('project_links_entity_type_idx').on(table.entityType),
    entityIdx: index('project_links_entity_idx').on(table.entityId),
}));
/**
 * Project Activity Table
 * Audit trail for project changes and events
 * Can be system-generated (project.created, project.updated, etc.) or user-created with activity types
 */
export const projectActivity = pgTable('project_activity', {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
        .references(() => projects.id, { onDelete: 'cascade' })
        .notNull(),
    typeId: uuid('type_id').references(() => projectActivityTypes.id, { onDelete: 'set null' }), // Reference to activity type (null for system activities)
    activityType: varchar('activity_type', { length: 100 }), // System activity type (project.created, project.updated, etc.) - null if typeId is set
    title: varchar('title', { length: 500 }), // User-provided title (for user-created activities)
    userId: varchar('user_id', { length: 255 }).notNull(), // User who performed the action
    description: text('description'), // Human-readable description
    link: varchar('link', { length: 500 }), // Optional link URL
    occurredAt: timestamp('occurred_at').defaultNow().notNull(), // When the activity occurred
    metadata: jsonb('metadata'), // Additional context (before/after values, etc.)
    createdAt: timestamp('created_at').defaultNow().notNull(), // When the activity record was created
}, (table) => ({
    projectIdx: index('project_activity_project_idx').on(table.projectId),
    typeIdx: index('project_activity_type_idx').on(table.typeId),
    activityTypeIdx: index('project_activity_activity_type_idx').on(table.activityType),
    userIdx: index('project_activity_user_idx').on(table.userId),
    occurredAtIdx: index('project_activity_occurred_at_idx').on(table.occurredAt),
    createdAtIdx: index('project_activity_created_at_idx').on(table.createdAt),
}));
/**
 * Project Notes Table (optional)
 * Stores notes/comments associated with projects
 */
export const projectNotes = pgTable('project_notes', {
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
}, (table) => ({
    projectIdx: index('project_notes_project_idx').on(table.projectId),
    createdByIdx: index('project_notes_created_by_idx').on(table.createdByUserId),
}));
// ─────────────────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ one, many }) => ({
    status: one(projectStatuses, {
        fields: [projects.statusId],
        references: [projectStatuses.id],
    }),
    links: many(projectLinks),
    activity: many(projectActivity),
    notes: many(projectNotes),
}));
export const projectStatusesRelations = relations(projectStatuses, ({ many }) => ({
    projects: many(projects),
}));
export const projectActivityTypesRelations = relations(projectActivityTypes, ({ many }) => ({
    activities: many(projectActivity),
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
    activityType: one(projectActivityTypes, {
        fields: [projectActivity.typeId],
        references: [projectActivityTypes.id],
    }),
}));
export const projectNotesRelations = relations(projectNotes, ({ one }) => ({
    project: one(projects, {
        fields: [projectNotes.projectId],
        references: [projects.id],
    }),
}));
/**
 * Defaults inserted by migrations (safe baseline).
 */
export const DEFAULT_PROJECT_STATUS_LABELS = ['Draft', 'Active', 'Completed', 'Cancelled', 'Archived'];
/**
 * System activity types (for automatic logging)
 * These are used when activities are created automatically by the system
 */
export const SYSTEM_ACTIVITY_TYPES = [
    'project.created',
    'project.updated',
    'project.status_changed',
    'project.link_added',
    'project.link_removed',
    'project.link_updated',
];
