import type { ProjectActivity } from '../schema/projects';
interface ActivityFeedProps {
    activities: ProjectActivity[];
    loading?: boolean;
    filter?: string;
    onFilterChange?: (filter: string) => void;
}
export declare function ActivityFeed({ activities, loading, filter, onFilterChange }: ActivityFeedProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ActivityFeed.d.ts.map