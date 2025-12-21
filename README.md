# @hit/feature-pack-projects

Projects feature pack - execution containers with teams, activity types, links, and activity log

## Installation

```bash
hit feature add projects
```

Or manually:
1. Add to `hit.yaml` under `feature_packs:`
2. Add `"@hit/feature-pack-projects": "github:c0x65o/hit-feature-pack-projects"` to `package.json`
3. Add `'@hit/feature-pack-projects'` to `hitPackages` array in `next.config.js`
4. Run `npm install`
5. Run `hit run` to generate routes

## Development

```bash
npm install
npm run build
```

## Features

- **Projects CRUD**: Create, read, update, and archive projects
- **Group-based Access**: Grant Auth groups roles (owner, manager, contributor, viewer) on projects (no per-project user member management)
- **Activity Types**: Define custom activity types for categorizing project activities
- **Generic Links**: Link projects to other entities (CRM accounts, marketing plans, metrics data sources, etc.)
- **Activity Log**: Complete audit trail of all project changes and user-created activities
- **Permission System**: Role-based access control with project-level permissions
- **Policy System**: Configurable read access (all authenticated vs groups only)

## API Endpoints

- `GET/POST /api/projects` - List or create projects
- `GET/PUT/DELETE /api/projects/[id]` - Get, update, or archive a project
- `GET/POST /api/projects/[projectId]/groups` - List or grant project group roles
- `GET/PUT/DELETE /api/projects/[projectId]/groups/[groupId]` - Manage project group roles
- `GET/POST /api/projects/activity-types` - List or create activity types (admin)
- `GET/PUT/DELETE /api/projects/activity-types/[id]` - Manage activity types (admin)
- `GET/POST /api/projects/[projectId]/links` - List or create project links
- `GET/PUT/DELETE /api/projects/[projectId]/links/[linkId]` - Manage project links
- `GET/POST /api/projects/[projectId]/activity` - View or create project activity log

## Configuration

Set `HIT_PROJECTS_READ_POLICY` environment variable to control read access:
- `all_authenticated` (default): All authenticated users can read projects
- `groups_only`: Only users in project-authorized groups can read projects
