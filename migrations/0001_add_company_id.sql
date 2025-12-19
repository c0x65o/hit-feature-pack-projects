-- Migration: Add company_id to projects table
-- This column enables optional CRM company association on projects.
-- Controlled by feature flags: enable_crm_company_association and require_crm_company

ALTER TABLE projects ADD COLUMN IF NOT EXISTS company_id UUID;

-- Index for efficient lookups by company
CREATE INDEX IF NOT EXISTS projects_company_idx ON projects(company_id);

-- Note: We intentionally do NOT add a foreign key constraint to crm_companies
-- because the CRM feature pack may not be installed. The application layer
-- validates the company_id when the feature flag is enabled.

