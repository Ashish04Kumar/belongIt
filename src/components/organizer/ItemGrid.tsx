import { OrganizerItem } from '@/types/organizer';
import { Card } from '@/components/ui/card';
import { MapPin, Package, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { ImageZoomModal } from './ImageZoomModal';

interface ItemGridProps {
  items: OrganizerItem[];
  onAddChild: (parentId: string, type: 'location' | 'item') => void;
  onEdit: (item: OrganizerItem) => void;
  onDelete: (id: string) => void;
  onItemClick?: (itemId: string) => void;
}

export const ItemGrid = ({ items, onAddChild, onEdit, onDelete, onItemClick }: ItemGridProps) => {
  const [zoomedImage, setZoomedImage] = useState<{ url: string; name: string } | null>(null);

  const getAllItemsWithPath = (items: OrganizerItem[], path: string[] = []): Array<OrganizerItem & { path: string[] }> => {
    const result: Array<OrganizerItem & { path: string[] }> = [];
    items.forEach(item => {
      const currentPath = [...path, item.name];
      result.push({ ...item, path: currentPath });
      if (item.children.length > 0) {
        result.push(...getAllItemsWithPath(item.children, currentPath));
      }
    });
    return result;
  };

  const allItems = getAllItemsWithPath(items);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {allItems.map((item) => (
          <Card key={item.id} className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow">
            {item.image && (
              <div 
                className="h-48 bg-muted cursor-pointer overflow-hidden"
                onClick={() => setZoomedImage({ url: item.image!, name: item.name })}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            )}
            <div className="p-4">
              {/* Breadcrumb Path */}
              {item.path.length > 1 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 overflow-x-auto pb-1">
                  {item.path.slice(0, -1).map((pathItem, index) => (
                    <span key={index} className="flex items-center gap-1 flex-shrink-0">
                      {pathItem}
                      <span className="text-muted-foreground/50">›</span>
                    </span>
                  ))}
                </div>
              )}

              <div 
                className="flex items-center gap-2 mb-2 cursor-pointer"
                onClick={() => onItemClick?.(item.id)}
              >
                {item.type === 'location' ? (
                  <MapPin className="h-5 w-5 text-accent flex-shrink-0" />
                ) : (
                  <Package className="h-5 w-5 text-primary flex-shrink-0" />
                )}
                <h3 className="font-semibold text-foreground break-words flex-1">{item.name}</h3>
              </div>
              
              {item.description && (
                <p className="text-sm text-muted-foreground mb-2 break-words line-clamp-2">
                  {item.description}
                </p>
              )}

              {item.physicalLocation && (
                <p className="text-xs text-muted-foreground mb-2 break-words">
                  📍 {item.physicalLocation}
                </p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                {item.type === 'location' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddChild(item.id, 'item')}
                    className="gap-1 flex-1"
                  >
                    <Plus className="h-3 w-3" />
                    Item
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(item)}
                  className="gap-1"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDelete(item.id)}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {zoomedImage && (
        <ImageZoomModal
          open={!!zoomedImage}
          onOpenChange={(open) => !open && setZoomedImage(null)}
          imageUrl={zoomedImage.url}
          imageName={zoomedImage.name}
        />
      )}
    </>
  );
};
