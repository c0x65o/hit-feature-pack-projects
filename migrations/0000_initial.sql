-- Feature Pack: projects
-- Initial schema migration
-- Creates tables for projects, project_statuses, project_milestones, project_links, and project_activity
-- Idempotent (safe to re-run with IF NOT EXISTS)

-- Projects table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "slug" VARCHAR(255),
  "description" TEXT,
  "status" VARCHAR(50) DEFAULT 'active' NOT NULL,
  "created_by_user_id" VARCHAR(255) NOT NULL,
  "created_on_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "last_updated_by_user_id" VARCHAR(255),
  "last_updated_on_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "projects_slug_unique" ON "projects" ("slug");
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects" ("status");
CREATE INDEX IF NOT EXISTS "projects_created_by_idx" ON "projects" ("created_by_user_id");

-- Project statuses table (setup-controlled)
CREATE TABLE IF NOT EXISTS "project_statuses" (
  "key" VARCHAR(50) PRIMARY KEY,
  "label" VARCHAR(100) NOT NULL,
  "color" VARCHAR(50),
  "sort_order" INTEGER DEFAULT 0 NOT NULL,
  "is_default" BOOLEAN DEFAULT FALSE NOT NULL,
  "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "project_statuses_sort_idx" ON "project_statuses" ("sort_order");
CREATE INDEX IF NOT EXISTS "project_statuses_active_idx" ON "project_statuses" ("is_active");
CREATE INDEX IF NOT EXISTS "project_statuses_default_idx" ON "project_statuses" ("is_default");

-- Seed default statuses (safe to re-run)
INSERT INTO "project_statuses" ("key", "label", "color", "sort_order", "is_default", "is_active")
VALUES
  ('draft', 'Draft', '#64748b', 10, FALSE, TRUE),
  ('active', 'Active', '#22c55e', 20, TRUE, TRUE),
  ('completed', 'Completed', '#3b82f6', 30, FALSE, TRUE),
  ('cancelled', 'Cancelled', '#ef4444', 40, FALSE, TRUE),
  ('archived', 'Archived', '#94a3b8', 50, FALSE, TRUE)
ON CONFLICT ("key") DO NOTHING;

-- Remove legacy per-user membership table
DROP TABLE IF EXISTS "project_members";

-- Project milestones table
CREATE TABLE IF NOT EXISTS "project_milestones" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "target_date" TIMESTAMP WITH TIME ZONE,
  "completed_date" TIMESTAMP WITH TIME ZONE,
  "status" VARCHAR(50) DEFAULT 'planned' NOT NULL,
  "created_by_user_id" VARCHAR(255) NOT NULL,
  "created_on_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "last_updated_by_user_id" VARCHAR(255),
  "last_updated_on_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "project_milestones_project_idx" ON "project_milestones" ("project_id");
CREATE INDEX IF NOT EXISTS "project_milestones_status_idx" ON "project_milestones" ("status");
CREATE INDEX IF NOT EXISTS "project_milestones_target_date_idx" ON "project_milestones" ("target_date");

-- Project links table
CREATE TABLE IF NOT EXISTS "project_links" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "entity_type" VARCHAR(100) NOT NULL,
  "entity_id" VARCHAR(255) NOT NULL,
  "metadata" JSONB,
  "created_by_user_id" VARCHAR(255) NOT NULL,
  "created_on_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "last_updated_by_user_id" VARCHAR(255),
  "last_updated_on_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "project_links_project_entity_unique" ON "project_links" ("project_id", "entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "project_links_project_idx" ON "project_links" ("project_id");
CREATE INDEX IF NOT EXISTS "project_links_entity_type_idx" ON "project_links" ("entity_type");
CREATE INDEX IF NOT EXISTS "project_links_entity_idx" ON "project_links" ("entity_id");

-- Project activity table
CREATE TABLE IF NOT EXISTS "project_activity" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "activity_type" VARCHAR(100) NOT NULL,
  "user_id" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "project_activity_project_idx" ON "project_activity" ("project_id");
CREATE INDEX IF NOT EXISTS "project_activity_activity_type_idx" ON "project_activity" ("activity_type");
CREATE INDEX IF NOT EXISTS "project_activity_user_idx" ON "project_activity" ("user_id");
CREATE INDEX IF NOT EXISTS "project_activity_created_at_idx" ON "project_activity" ("created_at");

-- Project notes table (optional)
CREATE TABLE IF NOT EXISTS "project_notes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "created_by_user_id" VARCHAR(255) NOT NULL,
  "created_on_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  "last_updated_by_user_id" VARCHAR(255),
  "last_updated_on_timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "project_notes_project_idx" ON "project_notes" ("project_id");
CREATE INDEX IF NOT EXISTS "project_notes_created_by_idx" ON "project_notes" ("created_by_user_id");
