import type { ProjectActivity } from '../schema/projects';
interface ActivityFeedProps {
    activities: ProjectActivity[];
    loading?: boolean;
    filter?: string;
    onFilterChange?: (filter: string) => void;
    onAddActivity?: () => void;
    onEditActivity?: (activity: ProjectActivity & {
        activityTypeRecord?: any;
    }) => void;
    onDeleteActivity?: (activity: ProjectActivity & {
        activityTypeRecord?: any;
    }) => void;
    canEdit?: boolean;
}
export declare function ActivityFeed({ activities, loading, filter, onFilterChange, onAddActivity, onEditActivity, onDeleteActivity, canEdit }: ActivityFeedProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ActivityFeed.d.ts.map