function normalizeReadPolicy() {
    return 'all_authenticated';
}
/**
 * Feature-flag-style policy shim for customer-specific behavior.
 *
 * Default is intentionally permissive: **all authenticated users can read**.
 */
export function getProjectsPolicy() {
    return {
        readPolicy: normalizeReadPolicy(),
    };
}
export function isProjectsGroupsOnlyRead() {
    return false;
}
