import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, FolderOpen, Package, MapPin, Maximize2, ScanBarcode } from 'lucide-react';
import { OrganizerItem } from '@/types/organizer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageZoomModal } from './ImageZoomModal';
import { BarcodeDisplay } from './BarcodeDisplay';

interface ItemNodeProps {
  item: OrganizerItem;
  onAddChild: (parentId: string, type: 'location' | 'item') => void;
  onEdit: (item: OrganizerItem) => void;
  onDelete: (id: string) => void;
  level?: number;
}

export const ItemNode = ({ item, onAddChild, onEdit, onDelete, level = 0 }: ItemNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const hasChildren = item.children.length > 0;

  return (
    <div className="animate-fade-in">
      <Card 
        className="mb-2 overflow-hidden transition-all hover:shadow-md"
        style={{ marginLeft: level > 0 ? `${level * 1.5}rem` : '0' }}
      >
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-3 p-4">
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {/* Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            {item.type === 'location' ? (
              <FolderOpen className="h-5 w-5 text-accent-foreground" />
            ) : (
              <Package className="h-5 w-5 text-accent-foreground" />
            )}
          </div>

          {/* Image Preview */}
          {item.image && (
            <div 
              className="h-12 w-12 overflow-hidden rounded-md border border-border cursor-pointer relative group"
              onClick={() => setShowImageZoom(true)}
            >
              <img 
                src={item.image} 
                alt={item.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="h-4 w-4 text-white" />
              </div>
            </div>
          )}

          {/* Item Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground truncate">{item.description}</p>
            )}
            {item.physicalLocation && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {item.physicalLocation}
              </p>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {item.type === 'location' && item.barcode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBarcode(true)}
                className="h-8 w-8 p-0"
                title="View barcode"
              >
                <ScanBarcode className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(item.id, 'location')}
              className="h-8 w-8 p-0"
              title="Add sub-location"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(item.id, 'item')}
              className="h-8 w-8 p-0"
              title="Add item"
            >
              <Package className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden p-4 space-y-3">
          <div className="flex items-start gap-3">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0 mt-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {/* Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent shrink-0">
              {item.type === 'location' ? (
                <FolderOpen className="h-5 w-5 text-accent-foreground" />
              ) : (
                <Package className="h-5 w-5 text-accent-foreground" />
              )}
            </div>

            {/* Image Preview */}
            {item.image && (
              <div 
                className="h-16 w-16 overflow-hidden rounded-md border border-border cursor-pointer relative group shrink-0"
                onClick={() => setShowImageZoom(true)}
              >
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-4 w-4 text-white" />
                </div>
              </div>
            )}

            {/* Item Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground break-words">{item.name}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground break-words mt-1">{item.description}</p>
              )}
              {item.physicalLocation && (
                <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1">
                  <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                  <span className="break-words">{item.physicalLocation}</span>
                </p>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Below content on mobile */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
            {item.type === 'location' && item.barcode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBarcode(true)}
                className="h-9 gap-2 flex-1"
              >
                <ScanBarcode className="h-4 w-4" />
                Barcode
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(item.id, 'location')}
              className="h-9 gap-2 flex-1"
            >
              <Plus className="h-4 w-4" />
              Location
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddChild(item.id, 'item')}
              className="h-9 gap-2 flex-1"
            >
              <Package className="h-4 w-4" />
              Item
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              className="h-9 w-9 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
              className="h-9 w-9 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Image Zoom Modal */}
      {item.image && (
        <ImageZoomModal
          open={showImageZoom}
          onOpenChange={setShowImageZoom}
          imageUrl={item.image}
          imageName={item.name}
        />
      )}

      {/* Barcode Display Modal */}
      {item.type === 'location' && item.barcode && (
        <BarcodeDisplay
          open={showBarcode}
          onOpenChange={setShowBarcode}
          barcode={item.barcode}
          locationName={item.name}
        />
      )}

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="animate-fade-in">
          {item.children.map((child) => (
            <ItemNode
              key={child.id}
              item={child}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
