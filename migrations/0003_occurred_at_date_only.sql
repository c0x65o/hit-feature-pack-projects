-- Feature Pack: projects
-- Migration: Change occurred_at from timestamp to date (date only, no time component)
-- Idempotent (safe to re-run)

-- Alter the column type from TIMESTAMP to DATE
-- This will truncate the time portion, keeping only the date
ALTER TABLE "project_activity"
  ALTER COLUMN "occurred_at" TYPE DATE
  USING "occurred_at"::DATE;
