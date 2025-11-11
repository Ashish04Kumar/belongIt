import { ChevronRight } from 'lucide-react';
import { OrganizerItem } from '@/types/organizer';

interface BreadcrumbProps {
  items: OrganizerItem[];
  currentItemId: string;
}

export const Breadcrumb = ({ items, currentItemId }: BreadcrumbProps) => {
  const findPath = (items: OrganizerItem[], targetId: string, path: OrganizerItem[] = []): OrganizerItem[] | null => {
    for (const item of items) {
      const currentPath = [...path, item];
      if (item.id === targetId) {
        return currentPath;
      }
      if (item.children.length > 0) {
        const found = findPath(item.children, targetId, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const path = findPath(items, currentItemId);
  if (!path) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4 p-3 rounded-lg bg-muted/50 overflow-x-auto">
      {path.map((item, index) => (
        <div key={item.id} className="flex items-center gap-1 flex-shrink-0">
          <span className={index === path.length - 1 ? 'text-foreground font-medium' : ''}>
            {item.name}
          </span>
          {index < path.length - 1 && <ChevronRight className="h-4 w-4" />}
        </div>
      ))}
    </div>
  );
};
