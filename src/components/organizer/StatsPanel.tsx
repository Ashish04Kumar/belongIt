import { Package, MapPin, TrendingUp, Clock } from 'lucide-react';
import { OrganizerItem } from '@/types/organizer';
import { Card } from '@/components/ui/card';

interface StatsPanelProps {
  items: OrganizerItem[];
}

export const StatsPanel = ({ items }: StatsPanelProps) => {
  const countItems = (items: OrganizerItem[]): number => {
    return items.reduce((count, item) => {
      return count + (item.type === 'item' ? 1 : 0) + countItems(item.children);
    }, 0);
  };

  const countLocations = (items: OrganizerItem[]): number => {
    return items.reduce((count, item) => {
      return count + (item.type === 'location' ? 1 : 0) + countLocations(item.children);
    }, 0);
  };

  const getMostPopulated = (items: OrganizerItem[]): { name: string; count: number } => {
    let maxLocation = { name: 'None', count: 0 };
    
    const traverse = (item: OrganizerItem) => {
      if (item.type === 'location') {
        const itemCount = countItems([item]);
        if (itemCount > maxLocation.count) {
          maxLocation = { name: item.name, count: itemCount };
        }
      }
      item.children.forEach(traverse);
    };
    
    items.forEach(traverse);
    return maxLocation;
  };

  const getRecentCount = (items: OrganizerItem[]): number => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const countRecent = (items: OrganizerItem[]): number => {
      return items.reduce((count, item) => {
        const isRecent = new Date(item.createdAt) > oneDayAgo;
        return count + (isRecent ? 1 : 0) + countRecent(item.children);
      }, 0);
    };
    
    return countRecent(items);
  };

  const totalItems = countItems(items);
  const totalLocations = countLocations(items);
  const mostPopulated = getMostPopulated(items);
  const recentCount = getRecentCount(items);

  const stats = [
    { label: 'Total Items', value: totalItems, icon: Package, color: 'text-primary' },
    { label: 'Locations', value: totalLocations, icon: MapPin, color: 'text-accent' },
    { label: 'Most Populated', value: mostPopulated.name, icon: TrendingUp, color: 'text-secondary' },
    { label: 'Added Today', value: recentCount, icon: Clock, color: 'text-muted-foreground' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 bg-card border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
              <p className="text-lg font-semibold text-foreground truncate">{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
