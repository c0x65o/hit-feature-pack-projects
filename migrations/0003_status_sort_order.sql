-- Feature Pack: projects
-- Normalize default project statuses (label/color/sort_order) so ordering is consistent everywhere.
-- Idempotent (safe to re-run)

INSERT INTO "project_statuses" ("label", "color", "sort_order", "is_active", "created_at", "updated_at")
VALUES
  -- Default order: Active first (requested), then Not Launched, Backburner, Draft, Completed, Cancelled, Archived
  ('Active', '#22c55e', 10, TRUE, NOW(), NOW()),
  ('Not Launched', '#f59e0b', 20, TRUE, NOW(), NOW()),
  ('Backburner', '#94a3b8', 30, TRUE, NOW(), NOW()),
  ('Draft', '#64748b', 40, TRUE, NOW(), NOW()),
  ('Completed', '#3b82f6', 50, TRUE, NOW(), NOW()),
  ('Cancelled', '#ef4444', 60, TRUE, NOW(), NOW()),
  ('Archived', '#94a3b8', 100, TRUE, NOW(), NOW())
ON CONFLICT ("label") DO UPDATE SET
  "color" = EXCLUDED."color",
  "sort_order" = EXCLUDED."sort_order",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = NOW();


