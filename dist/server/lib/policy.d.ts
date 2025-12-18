export type ProjectsReadPolicy = 'all_authenticated' | 'groups_only';
export interface ProjectsPolicy {
    readPolicy: ProjectsReadPolicy;
}
/**
 * Feature-flag-style policy shim for customer-specific behavior.
 *
 * Default is intentionally permissive: **all authenticated users can read**.
 *
 * Controls:
 * - HIT_PROJECTS_READ_POLICY=all_authenticated|groups_only
 */
export declare function getProjectsPolicy(): ProjectsPolicy;
export declare function isProjectsGroupsOnlyRead(): boolean;
//# sourceMappingURL=policy.d.ts.map