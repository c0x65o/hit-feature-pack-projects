-- Feature Pack: projects
-- Seed default views for Projects table
-- Idempotent (safe to re-run)

-- Canonical: group/filter by statusId, but keep a human-friendly ordering based on labels.
WITH desired_status_order AS (
  SELECT * FROM (VALUES
    (1, 'Backburner'),
    (2, 'Not Launched'),
    (3, 'Draft'),
    (4, 'Active'),
    (5, 'Completed'),
    (6, 'Cancelled'),
    (7, 'Archived')
  ) AS t(sort_order, label)
),
status_ids AS (
  SELECT
    dso.sort_order,
    ps.id::text AS status_id_text,
    ps.label
  FROM desired_status_order dso
  JOIN project_statuses ps ON ps.label = dso.label
),
status_group_by_json AS (
  SELECT jsonb_build_object(
    'field',
    'statusId',
    'sortOrder',
    jsonb_agg(status_id_text ORDER BY sort_order)
  ) AS group_by
  FROM status_ids
),
archived_status AS (
  SELECT ps.id::text AS status_id_text
  FROM project_statuses ps
  WHERE ps.label = 'Archived'
  LIMIT 1
)

-- 1. Insert "Status Group" view (default) - groups by status
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
  "group_by",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  'system',
  'projects',
  'Status Group',
  'Groups projects by status',
  TRUE,
  TRUE,
  FALSE,
  NULL,
  '[{"id": "lastUpdatedOnTimestamp", "desc": true}]'::jsonb,
  (SELECT group_by FROM status_group_by_json),
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "table_views"
  WHERE "table_id" = 'projects'
    AND "name" = 'Status Group'
    AND "is_system" = TRUE
);

-- 2. Insert "Active Projects" view - hides archived
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
    AND "name" = 'Active Projects'
    AND "is_system" = TRUE
);

-- 3. Insert "All Projects" view - shows everything
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

-- 4. Insert filter to exclude archived status for "Active Projects" view
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
  'statusId',
  'notEquals',
  (SELECT status_id_text FROM archived_status),
  'string',
  0
FROM "table_views" tv
WHERE tv."table_id" = 'projects'
  AND tv."name" = 'Active Projects'
  AND tv."is_system" = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM "table_view_filters" tvf
    WHERE tvf."view_id" = tv.id
      AND tvf."field" = 'statusId'
  );

