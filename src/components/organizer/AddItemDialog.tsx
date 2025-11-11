import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FolderOpen, Package, Plus, Camera, MapPin, Navigation } from 'lucide-react';
import { ItemFormData } from '@/types/organizer';
import { captureImage, pickImage, getCurrentLocation } from '@/lib/capacitor-utils';
import { useToast } from '@/hooks/use-toast';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItemFormData) => void;
  defaultType?: 'location' | 'item';
  editData?: {
    name: string;
    description: string;
    image: string | undefined;
    physicalLocation?: string;
    tags?: string[];
    expiryDate?: string;
    gpsLocation?: {
      latitude: number;
      longitude: number;
      timestamp: number;
    };
  };
  title?: string;
}

export const AddItemDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  defaultType = 'location',
  editData,
  title = 'Add New Item'
}: AddItemDialogProps) => {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    image: null,
    type: defaultType,
    physicalLocation: '',
    tags: [],
    expiryDate: '',
    gpsLocation: undefined,
  });
  const [tagInput, setTagInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (editData) {
        setFormData({
          name: editData.name,
          description: editData.description,
          image: null,
          type: defaultType,
          physicalLocation: editData.physicalLocation || '',
          tags: editData.tags || [],
          expiryDate: editData.expiryDate || '',
          gpsLocation: editData.gpsLocation,
        });
        setPreviewUrl(editData.image || null);
        setTagInput('');
      } else {
        setFormData({
          name: '',
          description: '',
          image: null,
          type: defaultType,
          physicalLocation: '',
          tags: [],
          expiryDate: '',
          gpsLocation: undefined,
        });
        setPreviewUrl(null);
        setTagInput('');
      }
    }
  }, [open, editData, defaultType]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
      onOpenChange(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || [],
    });
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleCaptureImage = async () => {
    const imageUrl = await captureImage();
    if (imageUrl) {
      setPreviewUrl(imageUrl);
      // Convert data URL to File object
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'camera-image.jpg', { type: 'image/jpeg' });
      setFormData({ ...formData, image: file });
      toast({
        title: 'Image captured',
        description: 'Image captured successfully',
      });
    }
  };

  const handlePickImage = async () => {
    const imageUrl = await pickImage();
    if (imageUrl) {
      setPreviewUrl(imageUrl);
      // Convert data URL to File object
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'gallery-image.jpg', { type: 'image/jpeg' });
      setFormData({ ...formData, image: file });
      toast({
        title: 'Image selected',
        description: 'Image selected successfully',
      });
    }
  };

  const handleGetLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setFormData({ ...formData, gpsLocation: location });
      toast({
        title: 'Location captured',
        description: `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`,
      });
    } else {
      toast({
        title: 'Location error',
        description: 'Could not get current location',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {formData.type === 'location' ? (
              <FolderOpen className="h-5 w-5 text-primary" />
            ) : (
              <Package className="h-5 w-5 text-primary" />
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.type === 'location' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'location' })}
                  className="flex-1"
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Location
                </Button>
                <Button
                  type="button"
                  variant={formData.type === 'item' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, type: 'item' })}
                  className="flex-1"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Item
                </Button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bedroom, Cupboard, Keys..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add additional details..."
                rows={3}
              />
            </div>

            {/* Physical Location - only for locations */}
            {formData.type === 'location' && (
              <div className="space-y-2">
                <Label htmlFor="physicalLocation">Physical Location</Label>
                <div className="flex gap-2">
                  <Input
                    id="physicalLocation"
                    value={formData.physicalLocation || ''}
                    onChange={(e) => setFormData({ ...formData, physicalLocation: e.target.value })}
                    placeholder="e.g., 123 Main St, Room 4, Floor 2..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGetLocation}
                    title="Get GPS Location"
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
                {formData.gpsLocation && (
                  <p className="text-xs text-muted-foreground">
                    GPS: {formData.gpsLocation.latitude.toFixed(6)}, {formData.gpsLocation.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Image</Label>
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-40 w-full rounded-lg object-cover border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCaptureImage}
                      className="flex-1 gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Take Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePickImage}
                      className="flex-1 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Gallery
                    </Button>
                  </div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/50"
                  >
                    <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Or browse files</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Expiry Date - only for items */}
            {formData.type === 'item' && (
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            )}

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., electronics, tools"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                />
                <Button type="button" size="icon" onClick={handleAddTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              {editData ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
