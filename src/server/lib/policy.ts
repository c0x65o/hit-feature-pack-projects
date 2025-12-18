// Projects list/detail should be visible to all authenticated users.
// Project-scoped groups are for management permissions, not visibility.
export type ProjectsReadPolicy = 'all_authenticated';

export interface ProjectsPolicy {
  readPolicy: ProjectsReadPolicy;
}

function normalizeReadPolicy(): ProjectsReadPolicy {
  return 'all_authenticated';
}

/**
 * Feature-flag-style policy shim for customer-specific behavior.
 *
 * Default is intentionally permissive: **all authenticated users can read**.
 */
export function getProjectsPolicy(): ProjectsPolicy {
  return {
    readPolicy: normalizeReadPolicy(),
  };
}

export function isProjectsGroupsOnlyRead(): boolean {
  return false;
}


