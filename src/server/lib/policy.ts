export type ProjectsReadPolicy = 'all_authenticated' | 'groups_only';

export interface ProjectsPolicy {
  readPolicy: ProjectsReadPolicy;
}

function normalizeReadPolicy(value: string | undefined | null): ProjectsReadPolicy {
  const v = String(value || '').trim().toLowerCase();
  if (v === 'groups_only' || v === 'groups-only' || v === 'groups') return 'groups_only';
  if (v === 'all_authenticated' || v === 'all-authenticated' || v === 'all') return 'all_authenticated';
  return 'all_authenticated';
}

/**
 * Feature-flag-style policy shim for customer-specific behavior.
 *
 * Default is intentionally permissive: **all authenticated users can read**.
 *
 * Controls:
 * - HIT_PROJECTS_READ_POLICY=all_authenticated|groups_only
 */
export function getProjectsPolicy(): ProjectsPolicy {
  return {
    readPolicy: normalizeReadPolicy(process.env.HIT_PROJECTS_READ_POLICY),
  };
}

export function isProjectsGroupsOnlyRead(): boolean {
  return getProjectsPolicy().readPolicy === 'groups_only';
}


