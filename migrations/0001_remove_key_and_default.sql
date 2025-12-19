-- Migration: Remove key and isDefault fields from project_statuses
-- Changes:
-- 1. Add id UUID primary key
-- 2. Remove key field
-- 3. Remove isDefault field
-- 4. Make label unique and limit to 50 chars (to match projects.status VARCHAR(50))
-- 5. Update projects.status to use label instead of key

-- Step 1: Add id column (temporary, will become primary key)
ALTER TABLE "project_statuses" ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid();

-- Step 2: Update existing rows to have unique IDs
UPDATE "project_statuses" SET "id" = gen_random_uuid() WHERE "id" IS NULL;

-- Step 3: Make id NOT NULL
ALTER TABLE "project_statuses" ALTER COLUMN "id" SET NOT NULL;

-- Step 4: Update projects.status to use label instead of key
-- First, create a mapping from old keys to labels
UPDATE "projects" p
SET "status" = ps."label"
FROM "project_statuses" ps
WHERE p."status" = ps."key";

-- Step 5: Drop old primary key constraint and indexes
ALTER TABLE "project_statuses" DROP CONSTRAINT IF EXISTS "project_statuses_pkey";
DROP INDEX IF EXISTS "project_statuses_default_idx";

-- Step 6: Make id the primary key
ALTER TABLE "project_statuses" ADD PRIMARY KEY ("id");

-- Step 7: Limit label to 50 chars and make it unique
ALTER TABLE "project_statuses" ALTER COLUMN "label" TYPE VARCHAR(50);
ALTER TABLE "project_statuses" ADD CONSTRAINT "project_statuses_label_unique" UNIQUE ("label");

-- Step 8: Drop key and isDefault columns
ALTER TABLE "project_statuses" DROP COLUMN IF EXISTS "key";
ALTER TABLE "project_statuses" DROP COLUMN IF EXISTS "is_default";

-- Step 9: Update seed data (remove key and isDefault)
DELETE FROM "project_statuses";

INSERT INTO "project_statuses" ("label", "color", "sort_order", "is_active")
VALUES
  ('Draft', '#64748b', 10, TRUE),
  ('Active', '#22c55e', 20, TRUE),
  ('Completed', '#3b82f6', 30, TRUE),
  ('Cancelled', '#ef4444', 40, TRUE),
  ('Archived', '#94a3b8', 50, TRUE)
ON CONFLICT ("label") DO NOTHING;

