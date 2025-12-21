import type { ProjectActivity } from '../schema/projects';
interface ActivityFeedProps {
    activities: ProjectActivity[];
    loading?: boolean;
    filter?: string;
    onFilterChange?: (filter: string) => void;
    onAddActivity?: () => void;
}
export declare function ActivityFeed({ activities, loading, filter, onFilterChange, onAddActivity }: ActivityFeedProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ActivityFeed.d.ts.map