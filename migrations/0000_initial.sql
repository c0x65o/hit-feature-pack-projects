-- Feature Pack: projects
-- Initial migration - seeds default project statuses
-- Tables are managed by Drizzle. This file only seeds universal data.
-- Idempotent (safe to re-run)

-- Seed default project statuses
INSERT INTO "project_statuses" ("label", "color", "sort_order", "is_active")
VALUES
  ('Active', '#22c55e', 10, TRUE),
  ('Not Launched', '#f59e0b', 20, TRUE),
  ('Backburner', '#94a3b8', 30, TRUE),
  ('Draft', '#64748b', 40, TRUE),
  ('Completed', '#3b82f6', 50, TRUE),
  ('Cancelled', '#ef4444', 60, TRUE),
  ('Archived', '#94a3b8', 100, TRUE)
ON CONFLICT ("label") DO UPDATE SET
  "color" = EXCLUDED."color",
  "sort_order" = EXCLUDED."sort_order",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = NOW();
