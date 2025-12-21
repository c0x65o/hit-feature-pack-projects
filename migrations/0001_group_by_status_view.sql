-- Feature Pack: projects
-- Pre-seed migration - creates "Group by Status" table view for projects table
-- Tables are managed by Drizzle. This file only seeds universal data.
-- Idempotent (safe to re-run)

-- Create "Group by Status" system view for projects table
INSERT INTO "table_views" (
  "user_id",
  "table_id",
  "name",
  "group_by",
  "is_system",
  "is_default",
  "is_shared",
  "created_at",
  "updated_at"
)
SELECT
  'system',
  'projects',
  'Group by Status',
  '{"field": "statusId"}'::jsonb,
  TRUE,
  FALSE,
  FALSE,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "table_views"
  WHERE "user_id" = 'system'
    AND "table_id" = 'projects'
    AND "name" = 'Group by Status'
);

