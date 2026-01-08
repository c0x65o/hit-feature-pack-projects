export function extractUserFromRequest(request) {
    // Check for token in cookie first
    let token = request.cookies.get('hit_token')?.value;
    // Fall back to Authorization header
    if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
    }
    // Always try to extract from JWT first (to get roles / group IDs)
    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                // Check expiration
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    return null;
                }
                const groupIdsRaw = payload.groupIds ?? payload.group_ids ?? payload.group_ids_list ?? payload.groups ?? payload.group_ids_csv;
                const groupIds = Array.isArray(groupIdsRaw)
                    ? groupIdsRaw.map((g) => String(g)).filter(Boolean)
                    : typeof groupIdsRaw === 'string'
                        ? groupIdsRaw
                            .split(',')
                            .map((g) => g.trim())
                            .filter(Boolean)
                        : [];
                return {
                    sub: payload.sub || payload.email || '',
                    email: payload.email || '',
                    roles: payload.roles || [],
                    groupIds,
                };
            }
        }
        catch {
            // JWT parsing failed, fall through to x-user-id header
        }
    }
    // Fall back to x-user-* headers (set by proxy in production)
    const xUserId = request.headers.get('x-user-id');
    if (xUserId) {
        const xUserEmail = request.headers.get('x-user-email') || '';
        const xUserRoles = request.headers.get('x-user-roles');
        const roles = xUserRoles ? xUserRoles.split(',').map((r) => r.trim()).filter(Boolean) : [];
        const xUserGroupIds = request.headers.get('x-user-group-ids') || request.headers.get('x-user-groups');
        const groupIds = xUserGroupIds
            ? xUserGroupIds
                .split(',')
                .map((g) => g.trim())
                .filter(Boolean)
            : [];
        return { sub: xUserId, email: xUserEmail, roles, groupIds };
    }
    return null;
}
