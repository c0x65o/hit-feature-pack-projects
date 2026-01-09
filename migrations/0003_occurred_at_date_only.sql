-- Feature Pack: projects
-- Migration: Change occurred_at from timestamp to date (date only, no time component)
-- Idempotent (safe to re-run across any environment)

-- Only alter if the column is still a timestamp type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_activity'
      AND column_name = 'occurred_at'
      AND data_type = 'timestamp without time zone'
  ) THEN
    -- Alter the column type from TIMESTAMP to DATE
    -- The USING clause automatically truncates the time portion from existing data
    ALTER TABLE "project_activity"
      ALTER COLUMN "occurred_at" TYPE DATE
      USING "occurred_at"::DATE;
    RAISE NOTICE 'Converted occurred_at from timestamp to date';
  ELSE
    RAISE NOTICE 'occurred_at is already date type, skipping';
  END IF;
END $$;
