# Projects Feature Pack - UI Specification (Aligned to Current Pack)

**Purpose**: Define the Projects UI that matches what the Projects feature pack provides today:
- `projects` (name, slug, description, status)
- `project_group_roles` (group_id + role)
- `project_milestones`
- `project_links` (generic entity refs)
- `project_activity`
- optional `project_notes`

**Non-goals (for this spec)**:
- Per-project user member management (Auth groups own membership)
- “Smart” entity linking flows that depend on cross-pack search/contracts
- Cross-pack “integration panels” (CRM/Marketing/Metrics/Tasks/Vault) and derived filters

---

## 1. Navigation & Routes

### Top-level nav
- **Projects** nav item (top-level, not nested under CRM/Locations)
- Icon: `FolderKanban` (or similar)
- Route: `/projects`

### Route map (minimal)
- `GET /projects` → Projects list
- `GET /projects/:projectId` → Project detail (hub)

**Note**: The pack currently ships pages for `/projects` and `/projects/:projectId`.
Create/Edit routes can be added later once the UI exists and is registered in `feature-pack.yaml`.

---

## 2. Primary Screens

### A) Projects List (`/projects`)

**Layout**
- Page title: **Projects**
- Primary CTA: **Create Project** button
- Secondary actions (optional, flagged):
  - Import
  - Saved Views

**Controls row**
- **Search input**: "Search by name, slug, description"
- **Filter chips/dropdowns**:
  - Status
- **Sort dropdown**:
  - Recently updated (default)
  - Name

**Results table**
- Columns:
  - **Name** (clickable link)
  - **Status** (badge)
  - **Updated** timestamp
- Row kebab menu:
  - View
  - Edit (if permitted)
  - Archive (if permitted)

**Empty state**
- Title: "No projects yet"
- Body: "Create your first project to track milestones, linked systems, and activity."
- CTA: Create Project

---

### B) Create Project (`/projects/new`)

**Single-page form**

**Fields (aligned to current schema)**
- Project Name (required)
- Slug (optional; server can generate from name if omitted)
- Status (default: active)
- Description (optional, textarea)

**Owner group (required for ownership)**
- Owner Group ID (string)
  - Defaults to the first group in the user’s `groupIds` (if present)
  - If the user has no groups, creation should fail (server enforces)

**Optional: initial links (simple, no smart linking)**
- Allow adding links by directly entering:
  - `entity_type` (string)
  - `entity_id` (string)
  - optional `metadata` (JSON)

**Actions**
- Primary: "Create Project"
- Secondary: "Cancel"

**Validation**
- Required: name
- If slug provided: must be unique (server enforces)
- Owner group id must be provided (or derivable from user)

**After create**
- Navigate to `/projects/:id` (Project detail)

---

### C) Project Detail (`/projects/:projectId`) — the "context-aware hub"

**Goal**: Answer what this project is, who's involved (via groups), where it is, what's next (milestones), what systems are attached, and what changed recently.

**Layout structure** (see section 3 for detailed breakdown)

---

### D) Edit Project (`/projects/:projectId/edit`)

Same fields as Create, pre-filled (name/slug/status/description, plus links if editing links here).

- Clean form (no tabs)
- "Save" and "Cancel"
- Keep it simple: edit fields, manage links

---

## 3. Project Detail Page Layout (MVP)

### 3.1 Header (always visible at top)

**Left**
- Project Name (H1)
- Status badge (clickable if user can change status)
- Slug (small text, optional)

**Right (actions)**
- Edit (if permitted)
- Archive (if permitted)
- "More" menu:
  - Copy link
  - Export (flagged)
  - Audit view (optional)

### 3.2 Summary strip (high-signal context)

Horizontal row of compact cards (only show what exists/enabled):

- **Milestones** (# open / # total)
- **Groups** (# groups with roles)
- **Links** (# linked entities)

### 3.3 Two-column body

#### Left column (core project content)

**1. Overview**
- Description (rich text optional, plain text OK)
- Key fields in 2-column definition list:
  - Status
  - Slug
  - Created/Updated

**2. Milestones**
- List of milestones:
  - Name
  - Due date
  - Status (Open/Done, or Planned/At Risk/Done)
  - Quick actions: Mark done, Edit, Delete
- CTA: "Add milestone"
- Optional: drag-to-reorder (flagged; not required for MVP)

**3. Groups** (replaces "Team" section)
- Group list with role badges (owner, manager, contributor, viewer)
- Add group button (simple: enter group_id + role)
- Inline role change dropdown (if allowed)
- Remove group action (if allowed)
- Note: Groups are managed via Auth module; this UI just shows project-scoped roles

**4. Activity**
- Feed of major events:
  - created
  - status changed
  - group added/removed
  - link added
  - milestone completed
- Filter chips (optional): All / Milestones / Groups / Links
- This feed is the audit trail UI

**5. Notes** (optional but usually worth it)
- Simple comment box + list of notes
- Notes are not tasks; keep them lightweight

#### Links (project-owned, generic)

Projects owns links as opaque references:
- Render a simple table/list of `project_links`:
  - entity_type
  - entity_id
  - metadata (collapsed/expandable)
- Actions:
  - Add link (enter entity_type/entity_id, optional metadata JSON)
  - Remove link

---

## 4. Reusable UI Components

### Core primitives

**ProjectStatusBadge**
- Consistent colors + labels
- Optional inline change dropdown (permission-gated)

**GroupRoleEditor**
- Add/edit/remove a `project_group_roles` row
- Input is `group_id` (string) + role

**MilestoneInlineEditor**
- Edit name/due date/status quickly without leaving page

**ActivityFeed**
- Structured rows:
  - Actor (user)
  - Action (verb)
  - Timestamp
  - Optional "details" expand

### Layout components

**SummaryCard**
- Small KPI / context display (milestones/groups/links)

---

## 5. Empty States & Failure States

### Broken link (entity deleted / permissions)
- Show a "Broken link" row:
  - Label: "{entity_type} {entity_id} (unavailable)"
  - Actions: Remove link
- Don't hard-error the whole page

### Permissions
- If user can view project but not manage:
  - Edit/Archive buttons hidden
  - Add milestone/group buttons hidden
  - Panels become read-only previews

---

## 6. Feature Flags / Capability Gating in UI

**Treat these as render gates (not security gates).**

For the current MVP, the only gating we need is permission-based:
- Hide “Edit/Archive” if user lacks `project.update` / `project.archive`
- Hide “Add group / change role / remove group” if user lacks `groups.manage`
- Hide “Add/edit/remove milestone” based on `milestones.manage`
- Hide “Add/remove link” based on `links.manage`

---

## 7. Optional UI Enhancements (flagged, don't bloat MVP)

These are nice but not necessary to ship a solid, reusable Project UI:

1. **Saved views** on list page (`projects.saved_views.enabled`)
2. **Bulk actions** on list page (`projects.bulk_actions.enabled`)
3. **Templates** ("Create project from template") (`projects.templates.enabled`)
4. **Custom fields** (render as a "Custom" section) (`projects.custom_fields.enabled`)
5. **Progress indicator** (manual % or derived from milestones) (`projects.progress.enabled`)
6. **Timeline view** (lightweight milestone timeline, not a full Gantt) (`projects.timeline.enabled`)

---

## 8. Wireframe Example (Text)

**Project: Website Redesign**  **Active**
Slug: website-redesign | Milestones: 3 open | Groups: 2 | Links: 4

**Overview**
Description…
Status: Active | Slug: website-redesign

**Milestones**
- [Open] Kickoff complete — Jan 10  (Mark done)
- [Open] Design approved — Feb 1  (Edit)
- [Done] Requirements gathered — Jan 8

**Groups**
Engineering (Owner) | Design (Manager)   [+ Add group]

**Activity**
- Alex changed status Draft → Active (Dec 1)
- Design group added (Dec 2)
- Link added: marketing.plan mp_123 (Dec 3)

**Links:**
- crm.account acct_123
- marketing.plan mp_123
- vault.item item_789

---

## 9. Future: Panel Plugin Slot (Optional)

If we re-introduce integration panels later, future-proof by allowing other packs to contribute panels without Projects owning that code.

**Projects only renders:**
- Core sections (overview/groups/milestones/activity)
- A **PanelRegion** on the right that renders contributed panels

This keeps Projects from accreting business logic.

---

## Implementation Checklist

### Phase 1: Core Pages
- [x] Projects list page (`/projects`)
- [x] Project detail page (`/projects/[id]`) - minimal version exists, needs full UI
- [x] Project creation form (`/projects/new`)
- [x] Project edit form (`/projects/[id]/edit`)

### Phase 2: Core Components
- [x] ProjectStatusBadge
- [x] GroupRoleEditor (group_id + role)
- [x] MilestoneInlineEditor
- [x] ActivityFeed
- [x] SummaryCard
- [x] LinksEditor (entity_type/entity_id + optional metadata)

### Phase 3: Polish
- [x] Empty states for all sections
- [x] Error states (broken links, permissions)
- [x] Loading states
- [x] Mobile responsive layout

---

## Notes

- **No per-project user member management**: Groups are managed via Auth module; Projects UI only shows project-scoped roles.
- **Server-side permissions still enforced**: UI gates are for UX only; server APIs enforce actual authorization.
- **Keep it modular**: Projects owns core UI + generic links; other packs integrate later via contracts.

