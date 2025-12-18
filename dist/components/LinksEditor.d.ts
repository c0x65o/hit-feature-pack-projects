import type { ProjectLink } from '../schema/projects';
interface LinksEditorProps {
    links: ProjectLink[];
    onAdd: (link: {
        entityType: string;
        entityId: string;
        metadata?: Record<string, unknown>;
    }) => Promise<void>;
    onRemove: (linkId: string) => Promise<void>;
    canManage?: boolean;
}
export declare function LinksEditor({ links, onAdd, onRemove, canManage }: LinksEditorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=LinksEditor.d.ts.map