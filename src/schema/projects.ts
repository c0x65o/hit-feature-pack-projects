import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────────────────────
// TABLES
// ─────────────────────────────────────────────────────────────────────────────

// Example table - replace with your actual schema
// export const ProjectsItems = pgTable('projects_items', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   name: text('name').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
// });

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

// export type ProjectsItem = InferSelectModel<typeof ProjectsItems>;
// export type InsertProjectsItem = InferInsertModel<typeof ProjectsItems>;
