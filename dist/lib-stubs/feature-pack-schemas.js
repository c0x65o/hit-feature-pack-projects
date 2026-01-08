/**
 * Stub for @/lib/feature-pack-schemas
 *
 * This is a type-only stub for feature pack compilation.
 * At runtime, the consuming application provides the actual implementation
 * via the generated lib/feature-pack-schemas.ts file.
 */
// Re-export schema tables from this feature pack
export { projects, projectStatuses, projectActivityTypes, projectLinks, projectActivity, projectNotes, DEFAULT_PROJECT_STATUS_LABELS, SYSTEM_ACTIVITY_TYPES, } from '../schema/projects';
// Stubs for forms feature pack schemas (provided at runtime by consuming app)
// These are minimal type stubs to allow compilation
import { pgTable, varchar, text, boolean, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
export const forms = pgTable('forms', {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
});
export const formVersions = pgTable('form_versions', {
    id: varchar('id', { length: 255 }).primaryKey(),
    formId: varchar('form_id', { length: 255 }).notNull(),
    version: integer('version').notNull(),
    status: varchar('status', { length: 64 }).notNull(),
    listConfig: jsonb('list_config'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const formFields = pgTable('form_fields', {
    id: varchar('id', { length: 255 }).primaryKey(),
    formId: varchar('form_id', { length: 255 }).notNull(),
    versionId: varchar('version_id', { length: 255 }).notNull(),
    key: varchar('key', { length: 255 }).notNull(),
    label: varchar('label', { length: 255 }).notNull(),
    type: varchar('type', { length: 64 }).notNull(),
    order: integer('order').notNull().default(0),
    hidden: boolean('hidden').notNull().default(false),
    required: boolean('required').notNull().default(false),
    showInTable: boolean('show_in_table').notNull().default(true),
    config: jsonb('config'),
    defaultValue: jsonb('default_value'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const formEntries = pgTable('form_entries', {
    id: varchar('id', { length: 255 }).primaryKey(),
    formId: varchar('form_id', { length: 255 }).notNull(),
    createdByUserId: varchar('created_by_user_id', { length: 255 }).notNull(),
    updatedByUserId: varchar('updated_by_user_id', { length: 255 }),
    data: jsonb('data').notNull(),
    searchText: text('search_text'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    formIdIdx: index('form_entries_form_id_idx').on(table.formId),
}));
export const formsAcls = pgTable('forms_acls', {
    id: varchar('id', { length: 255 }).primaryKey(),
    formId: varchar('form_id', { length: 255 }).notNull(),
    principalId: varchar('principal_id', { length: 255 }).notNull(),
    permissions: jsonb('permissions'),
});
