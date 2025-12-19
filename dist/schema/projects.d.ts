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
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
/**
 * Projects Table
 * Stores project records - domain-agnostic execution containers
 */
export declare const projects: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "projects";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "projects";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "projects";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        slug: import("drizzle-orm/pg-core").PgColumn<{
            name: "slug";
            tableName: "projects";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "projects";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        statusId: import("drizzle-orm/pg-core").PgColumn<{
            name: "status_id";
            tableName: "projects";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        companyId: import("drizzle-orm/pg-core").PgColumn<{
            name: "company_id";
            tableName: "projects";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by_user_id";
            tableName: "projects";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdOnTimestamp: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_on_timestamp";
            tableName: "projects";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        lastUpdatedByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_updated_by_user_id";
            tableName: "projects";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        lastUpdatedOnTimestamp: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_updated_on_timestamp";
            tableName: "projects";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Project Statuses Table (setup-controlled)
 * Defines allowed project statuses and their display metadata.
 *
 * Seeded by migrations, then fully manageable via Setup UI.
 */
export declare const projectStatuses: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "project_statuses";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "project_statuses";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        label: import("drizzle-orm/pg-core").PgColumn<{
            name: "label";
            tableName: "project_statuses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        color: import("drizzle-orm/pg-core").PgColumn<{
            name: "color";
            tableName: "project_statuses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        sortOrder: import("drizzle-orm/pg-core").PgColumn<{
            name: "sort_order";
            tableName: "project_statuses";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "project_statuses";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "project_statuses";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "project_statuses";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Project Milestones Table
 * Stores project milestones/goals with target dates
 */
export declare const projectMilestones: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "project_milestones";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "project_milestones";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        projectId: import("drizzle-orm/pg-core").PgColumn<{
            name: "project_id";
            tableName: "project_milestones";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "project_milestones";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "project_milestones";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        targetDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "target_date";
            tableName: "project_milestones";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        completedDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "completed_date";
            tableName: "project_milestones";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "project_milestones";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by_user_id";
            tableName: "project_milestones";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdOnTimestamp: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_on_timestamp";
            tableName: "project_milestones";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        lastUpdatedByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_updated_by_user_id";
            tableName: "project_milestones";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        lastUpdatedOnTimestamp: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_updated_on_timestamp";
            tableName: "project_milestones";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Project Links Table
 * Generic linking table for references to other systems/entities
 * Uses entity_type + entity_id pattern (no cross-pack foreign keys)
 * Examples: crm_account, marketing_plan, metrics_data_source, vault_item, location, task_query
 */
export declare const projectLinks: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "project_links";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "project_links";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        projectId: import("drizzle-orm/pg-core").PgColumn<{
            name: "project_id";
            tableName: "project_links";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        entityType: import("drizzle-orm/pg-core").PgColumn<{
            name: "entity_type";
            tableName: "project_links";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        entityId: import("drizzle-orm/pg-core").PgColumn<{
            name: "entity_id";
            tableName: "project_links";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        metadata: import("drizzle-orm/pg-core").PgColumn<{
            name: "metadata";
            tableName: "project_links";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by_user_id";
            tableName: "project_links";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdOnTimestamp: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_on_timestamp";
            tableName: "project_links";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        lastUpdatedByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_updated_by_user_id";
            tableName: "project_links";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        lastUpdatedOnTimestamp: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_updated_on_timestamp";
            tableName: "project_links";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Project Activity Table
 * Audit trail for project changes and events
 * Records: project.created, project.updated, project.status_changed,
 *          project.link_added, project.link_removed,
 *          project.milestone_created, project.milestone_updated
 */
export declare const projectActivity: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "project_activity";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "project_activity";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        projectId: import("drizzle-orm/pg-core").PgColumn<{
            name: "project_id";
            tableName: "project_activity";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        activityType: import("drizzle-orm/pg-core").PgColumn<{
            name: "activity_type";
            tableName: "project_activity";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "project_activity";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "project_activity";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        metadata: import("drizzle-orm/pg-core").PgColumn<{
            name: "metadata";
            tableName: "project_activity";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "project_activity";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
/**
 * Project Notes Table (optional)
 * Stores notes/comments associated with projects
 */
export declare const projectNotes: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "project_notes";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "project_notes";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        projectId: import("drizzle-orm/pg-core").PgColumn<{
            name: "project_id";
            tableName: "project_notes";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        content: import("drizzle-orm/pg-core").PgColumn<{
            name: "content";
            tableName: "project_notes";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by_user_id";
            tableName: "project_notes";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdOnTimestamp: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_on_timestamp";
            tableName: "project_notes";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        lastUpdatedByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_updated_by_user_id";
            tableName: "project_notes";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        lastUpdatedOnTimestamp: import("drizzle-orm/pg-core").PgColumn<{
            name: "last_updated_on_timestamp";
            tableName: "project_notes";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const projectsRelations: import("drizzle-orm").Relations<"projects", {
    status: import("drizzle-orm").One<"project_statuses", true>;
    milestones: import("drizzle-orm").Many<"project_milestones">;
    links: import("drizzle-orm").Many<"project_links">;
    activity: import("drizzle-orm").Many<"project_activity">;
    notes: import("drizzle-orm").Many<"project_notes">;
}>;
export declare const projectStatusesRelations: import("drizzle-orm").Relations<"project_statuses", {
    projects: import("drizzle-orm").Many<"projects">;
}>;
export declare const projectMilestonesRelations: import("drizzle-orm").Relations<"project_milestones", {
    project: import("drizzle-orm").One<"projects", true>;
}>;
export declare const projectLinksRelations: import("drizzle-orm").Relations<"project_links", {
    project: import("drizzle-orm").One<"projects", true>;
}>;
export declare const projectActivityRelations: import("drizzle-orm").Relations<"project_activity", {
    project: import("drizzle-orm").One<"projects", true>;
}>;
export declare const projectNotesRelations: import("drizzle-orm").Relations<"project_notes", {
    project: import("drizzle-orm").One<"projects", true>;
}>;
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
/**
 * ProjectStatus is setup-controlled and therefore not a fixed union.
 * Keep this as a string to avoid drift between UI/constants and DB.
 */
export type ProjectStatus = string;
/**
 * Defaults inserted by migrations (safe baseline).
 */
export declare const DEFAULT_PROJECT_STATUS_LABELS: readonly ["Draft", "Active", "Completed", "Cancelled", "Archived"];
export type DefaultProjectStatusLabel = (typeof DEFAULT_PROJECT_STATUS_LABELS)[number];
export declare const MILESTONE_STATUSES: readonly ["planned", "in_progress", "completed", "cancelled"];
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];
export declare const ACTIVITY_TYPES: readonly ["project.created", "project.updated", "project.status_changed", "project.link_added", "project.link_removed", "project.link_updated", "project.milestone_created", "project.milestone_updated", "project.milestone_completed", "project.milestone_deleted"];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
//# sourceMappingURL=projects.d.ts.map