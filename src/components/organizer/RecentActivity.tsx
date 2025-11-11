import { Clock, Package, MapPin } from 'lucide-react';
import { OrganizerItem } from '@/types/organizer';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RecentActivityProps {
  items: OrganizerItem[];
}

export const RecentActivity = ({ items }: RecentActivityProps) => {
  const getAllItems = (items: OrganizerItem[]): OrganizerItem[] => {
    const result: OrganizerItem[] = [];
    const traverse = (items: OrganizerItem[]) => {
      items.forEach(item => {
        result.push(item);
        traverse(item.children);
      });
    };
    traverse(items);
    return result;
  };

  const allItems = getAllItems(items);
  const recentItems = allItems
    .sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(a.createdAt);
      const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  if (recentItems.length === 0) return null;

  return (
    <Card className="p-4 mb-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      </div>
      <ScrollArea className="h-[120px]">
        <div className="space-y-2">
          {recentItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              {item.type === 'location' ? (
                <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
              ) : (
                <Package className="h-4 w-4 text-primary flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.updatedAt ? 'Updated' : 'Added'} {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
