export type ProjectsReadPolicy = 'all_authenticated';
export interface ProjectsPolicy {
    readPolicy: ProjectsReadPolicy;
}
/**
 * Feature-flag-style policy shim for customer-specific behavior.
 *
 * Default is intentionally permissive: **all authenticated users can read**.
 */
export declare function getProjectsPolicy(): ProjectsPolicy;
export declare function isProjectsGroupsOnlyRead(): boolean;
//# sourceMappingURL=policy.d.ts.map