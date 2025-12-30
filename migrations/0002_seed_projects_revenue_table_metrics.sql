-- Feature Pack: projects
-- Seed metric-backed table columns for the Projects DataTable (tableId="projects").
--
-- Why this lives here:
-- - The "projects" pack owns the Projects table UX (including computed metric columns).
-- - The metrics-core pack provides the storage/evaluation infra (metrics_segments, metrics_metric_points).
-- - Deployed environments only auto-run feature-pack SQL under migrations/feature-packs/*.sql.
--
-- This migration is idempotent and safe to re-run.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'metrics_segments'
  ) THEN
    RAISE EXCEPTION 'Table metrics_segments does not exist. Ensure metrics-core migrations ran first.';
  END IF;
END $$;

INSERT INTO "metrics_segments" (
  "id",
  "key",
  "entity_kind",
  "label",
  "description",
  "rule",
  "is_active",
  "created_at",
  "updated_at"
)
VALUES
  (
    'seg_seed_table_metric_projects_revenue_30d_usd',
    'table_metric.projects.revenue_30d_usd',
    'project',
    'Revenue (30d)',
    'Computed metric column: sum(gross_revenue_usd) over last 30 days.',
    '{
      "kind": "table_metric",
      "metricKey": "gross_revenue_usd",
      "agg": "sum",
      "window": "last_30_days",
      "table": {
        "tableId": "projects",
        "columnKey": "revenue_30d_usd",
        "columnLabel": "Gross Revenue (30d)",
        "format": "usd",
        "decimals": 2,
        "sortOrder": 10,
        "entityIdField": "id"
      }
    }'::jsonb,
    TRUE,
    NOW(),
    NOW()
  ),
  (
    'seg_seed_table_metric_projects_gross_revenue_all_time_usd',
    'table_metric.projects.gross_revenue_all_time_usd',
    'project',
    'Gross Revenue (All-time)',
    'Computed metric column: sum(gross_revenue_usd) all-time.',
    '{
      "kind": "table_metric",
      "metricKey": "gross_revenue_usd",
      "agg": "sum",
      "window": "all_time",
      "table": {
        "tableId": "projects",
        "columnKey": "revenue_all_time_usd",
        "columnLabel": "Gross Revenue (All-time)",
        "format": "usd",
        "decimals": 2,
        "sortOrder": 20,
        "entityIdField": "id"
      }
    }'::jsonb,
    TRUE,
    NOW(),
    NOW()
  )
ON CONFLICT ("key") DO UPDATE SET
  "entity_kind" = EXCLUDED."entity_kind",
  "label" = EXCLUDED."label",
  "description" = EXCLUDED."description",
  "rule" = EXCLUDED."rule",
  "is_active" = EXCLUDED."is_active",
  "updated_at" = EXCLUDED."updated_at";


