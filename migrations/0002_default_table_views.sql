-- Feature Pack: projects
-- Seed default views for Projects table
-- Idempotent (safe to re-run)

-- 1. Insert "Active Projects" view (default) - hides archived
INSERT INTO "table_views" (
  "id",
  "user_id",
  "table_id",
  "name",
  "description",
  "is_default",
  "is_system",
  "is_shared",
  "column_visibility",
  "sorting",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  'system',
  'projects',
  'Active Projects',
  'Shows only active projects, hiding archived ones',
  TRUE,
  TRUE,
  FALSE,
  NULL,
  '[{"id": "lastUpdatedOnTimestamp", "desc": true}]'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "table_views"
  WHERE "table_id" = 'projects'
    AND "name" = 'Active Projects'
    AND "is_system" = TRUE
);

-- 2. Insert "All Projects" view - shows everything
INSERT INTO "table_views" (
  "id",
  "user_id",
  "table_id",
  "name",
  "description",
  "is_default",
  "is_system",
  "is_shared",
  "column_visibility",
  "sorting",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  'system',
  'projects',
  'All Projects',
  'Shows all projects including archived',
  FALSE,
  TRUE,
  FALSE,
  NULL,
  '[{"id": "lastUpdatedOnTimestamp", "desc": true}]'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "table_views"
  WHERE "table_id" = 'projects'
    AND "name" = 'All Projects'
    AND "is_system" = TRUE
);

-- 3. Insert filter to exclude archived status for "Active Projects" view
INSERT INTO "table_view_filters" (
  "id",
  "view_id",
  "field",
  "operator",
  "value",
  "value_type",
  "sort_order"
)
SELECT
  gen_random_uuid(),
  tv.id,
  'status',
  'notEquals',
  'archived',
  'string',
  0
FROM "table_views" tv
WHERE tv."table_id" = 'projects'
  AND tv."name" = 'Active Projects'
  AND tv."is_system" = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM "table_view_filters" tvf
    WHERE tvf."view_id" = tv.id
      AND tvf."field" = 'status'
  );

