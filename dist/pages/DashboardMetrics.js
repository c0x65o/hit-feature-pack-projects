'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Dashboards } from '@hit/feature-pack-dashboard-shell';
/**
 * Projects Metrics Dashboard page - renders the shared Dashboards component
 * with pack="projects" preset.
 *
 * This provides a clean URL at /projects/dashboard instead of /dashboards?pack=projects
 */
export function DashboardMetrics() {
    return _jsx(Dashboards, { pack: "projects" });
}
export default DashboardMetrics;
