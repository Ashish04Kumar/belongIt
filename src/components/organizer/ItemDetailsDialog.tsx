import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OrganizerItem } from '@/types/organizer';
import { MapPin, Package, Calendar, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: OrganizerItem | null;
}

export const ItemDetailsDialog = ({ open, onOpenChange, item }: ItemDetailsDialogProps) => {
  if (!item) return null;

  const isExpiringSoon = item.expiryDate && new Date(item.expiryDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.type === 'location' ? (
              <MapPin className="h-5 w-5 text-accent" />
            ) : (
              <Package className="h-5 w-5 text-primary" />
            )}
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          {item.image && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div>
              <h4 className="text-sm font-semibold mb-1 text-foreground">Description</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          )}

          {/* Physical Location */}
          {item.physicalLocation && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Physical Location</h4>
                <p className="text-sm text-muted-foreground">{item.physicalLocation}</p>
              </div>
            </div>
          )}

          {/* GPS Location */}
          {item.gpsLocation && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">GPS Coordinates</h4>
                <p className="text-sm text-muted-foreground">
                  Lat: {item.gpsLocation.latitude.toFixed(6)}, Lng: {item.gpsLocation.longitude.toFixed(6)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${item.gpsLocation.latitude},${item.gpsLocation.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View on Maps
                </a>
              </div>
            </div>
          )}

          {/* Expiry Date */}
          {item.expiryDate && (
            <div className="flex items-start gap-2">
              <Calendar className={`h-4 w-4 mt-0.5 ${isExpired ? 'text-destructive' : isExpiringSoon ? 'text-orange-500' : 'text-muted-foreground'}`} />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Expiry Date</h4>
                <p className={`text-sm ${isExpired ? 'text-destructive' : isExpiringSoon ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {format(new Date(item.expiryDate), 'PPP')}
                  {isExpired && ' - Expired'}
                  {isExpiringSoon && !isExpired && ' - Expiring Soon'}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-2 text-foreground">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-start gap-2 pt-4 border-t border-border">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p>Created: {format(new Date(item.createdAt), 'PPp')}</p>
              <p>Updated: {format(new Date(item.updatedAt), 'PPp')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
