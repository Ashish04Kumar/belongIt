import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Home, Settings, ScanBarcode, LayoutGrid, List, Network, Bell, Tag } from 'lucide-react';
import { OrganizerItem, ItemFormData, ViewMode } from '@/types/organizer';
import { ItemNode } from '@/components/organizer/ItemNode';
import { ItemGrid } from '@/components/organizer/ItemGrid';
import { ItemList } from '@/components/organizer/ItemList';
import { AddItemDialog } from '@/components/organizer/AddItemDialog';
import { BarcodeScanner } from '@/components/organizer/BarcodeScanner';
import { ItemDetailsDialog } from '@/components/organizer/ItemDetailsDialog';
import { StatsPanel } from '@/components/organizer/StatsPanel';
import { RecentActivity } from '@/components/organizer/RecentActivity';
import { Breadcrumb } from '@/components/organizer/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { initializePushNotifications, scheduleExpiryNotification, checkExpiringItems } from '@/lib/capacitor-utils';

const Index = () => {
  const [items, setItems] = useState<OrganizerItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<OrganizerItem | null>(null);
  const [editingItem, setEditingItem] = useState<OrganizerItem | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);
  const [defaultType, setDefaultType] = useState<'location' | 'item'>('location');
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [expiringItemsCount, setExpiringItemsCount] = useState(0);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const { toast } = useToast();

  // Initialize notifications on mount
  useEffect(() => {
    initializePushNotifications();
  }, []);

  // Check for expiring items
  useEffect(() => {
    const expiring = checkExpiringItems(items);
    setExpiringItemsCount(expiring.length);
    
    if (expiring.length > 0) {
      toast({
        title: '⚠️ Items Expiring Soon',
        description: `${expiring.length} item(s) will expire within 3 days`,
      });
    }
  }, [items]);

  // Add new item or location
  const handleAddItem = (data: ItemFormData) => {
    const newItem: OrganizerItem = {
      id: Date.now().toString(),
      name: data.name,
      description: data.description,
      image: data.image ? URL.createObjectURL(data.image) : undefined,
      parentId: parentIdForNew,
      children: [],
      type: data.type,
      createdAt: new Date(),
      physicalLocation: data.physicalLocation,
      barcode: data.type === 'location' ? `LOC-${Date.now()}` : `ITEM-${Date.now()}`,
      tags: data.tags,
      expiryDate: data.expiryDate,
      gpsLocation: data.gpsLocation,
    };

    if (parentIdForNew) {
      // Add as child
      setItems(addChildToParent(items, parentIdForNew, newItem));
    } else {
      // Add as root
      setItems([...items, newItem]);
    }

    // Schedule notification if expiry date is set
    if (data.expiryDate) {
      scheduleExpiryNotification(newItem.id, newItem.name, data.expiryDate);
    }

    toast({
      title: 'Added successfully',
      description: `${data.type === 'location' ? 'Location' : 'Item'} "${data.name}" has been added.`,
    });
  };

  // Update existing item
  const handleUpdateItem = (data: ItemFormData) => {
    if (!editingItem) return;

    const updatedItem: OrganizerItem = {
      ...editingItem,
      name: data.name,
      description: data.description,
      image: data.image ? URL.createObjectURL(data.image) : editingItem.image,
      type: data.type,
      updatedAt: new Date(),
      tags: data.tags,
      expiryDate: data.expiryDate,
      gpsLocation: data.gpsLocation,
      physicalLocation: data.physicalLocation,
    };

    setItems(updateItemInTree(items, updatedItem));
    setEditingItem(null);

    // Schedule notification if expiry date is set or updated
    if (data.expiryDate) {
      scheduleExpiryNotification(updatedItem.id, updatedItem.name, data.expiryDate);
    }

    toast({
      title: 'Updated successfully',
      description: `"${data.name}" has been updated.`,
    });
  };

  // Delete item
  const handleDelete = (id: string) => {
    setItems(deleteItemFromTree(items, id));
    toast({
      title: 'Deleted',
      description: 'Item has been removed.',
      variant: 'destructive',
    });
  };

  // Open dialog for adding child
  const handleAddChild = (parentId: string, type: 'location' | 'item') => {
    setParentIdForNew(parentId);
    setDefaultType(type);
    setEditingItem(null);
    setDialogOpen(true);
  };

  // Open dialog for editing
  const handleEdit = (item: OrganizerItem) => {
    setEditingItem(item);
    setParentIdForNew(null);
    setDefaultType(item.type);
    setDialogOpen(true);
  };

  // Helper: Add child to parent
  const addChildToParent = (items: OrganizerItem[], parentId: string, newChild: OrganizerItem): OrganizerItem[] => {
    return items.map(item => {
      if (item.id === parentId) {
        return { ...item, children: [...item.children, newChild] };
      }
      if (item.children.length > 0) {
        return { ...item, children: addChildToParent(item.children, parentId, newChild) };
      }
      return item;
    });
  };

  // Helper: Update item in tree
  const updateItemInTree = (items: OrganizerItem[], updatedItem: OrganizerItem): OrganizerItem[] => {
    return items.map(item => {
      if (item.id === updatedItem.id) {
        return { ...updatedItem, children: item.children };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateItemInTree(item.children, updatedItem) };
      }
      return item;
    });
  };

  // Helper: Delete item from tree
  const deleteItemFromTree = (items: OrganizerItem[], id: string): OrganizerItem[] => {
    return items
      .filter(item => item.id !== id)
      .map(item => ({
        ...item,
        children: deleteItemFromTree(item.children, id),
      }));
  };

  // Helper: Search items (includes tag matching)
  const searchInTree = (items: OrganizerItem[], query: string, tags: string[]): OrganizerItem[] => {
    if (!query && tags.length === 0) return items;
    
    return items.reduce<OrganizerItem[]>((acc, item) => {
      const matchesSearch = !query || 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
      
      const matchesTags = tags.length === 0 || 
        (item.tags && tags.some(tag => item.tags?.includes(tag)));
      
      const filteredChildren = searchInTree(item.children, query, tags);
      
      if ((matchesSearch && matchesTags) || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren,
        });
      }
      
      return acc;
    }, []);
  };

  const filteredItems = searchInTree(items, searchQuery, selectedTags);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    const collectTags = (items: OrganizerItem[]) => {
      items.forEach(item => {
        item.tags?.forEach(tag => tags.add(tag));
        collectTags(item.children);
      });
    };
    collectTags(items);
    return Array.from(tags).sort();
  }, [items]);

  // Get search suggestions
  const searchSuggestions = useMemo(() => {
    const suggestions = new Set<string>();
    const collectSuggestions = (items: OrganizerItem[]) => {
      items.forEach(item => {
        suggestions.add(item.name);
        collectSuggestions(item.children);
      });
    };
    collectSuggestions(items);
    return Array.from(suggestions).sort();
  }, [items]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    setTagSheetOpen(false);
  };

  // Get full path for an item
  const getItemPath = (items: OrganizerItem[], targetId: string, path: string[] = []): string[] | null => {
    for (const item of items) {
      const currentPath = [...path, item.name];
      if (item.id === targetId) return currentPath;
      if (item.children.length > 0) {
        const found = getItemPath(item.children, targetId, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  // Get all items with a specific tag
  const getItemsWithTag = (tag: string) => {
    const result: Array<{ item: OrganizerItem; path: string[] }> = [];
    const collectItems = (items: OrganizerItem[], parentPath: string[] = []) => {
      items.forEach(item => {
        const currentPath = [...parentPath, item.name];
        if (item.tags?.includes(tag)) {
          result.push({ item, path: currentPath });
        }
        collectItems(item.children, currentPath);
      });
    };
    collectItems(items);
    return result;
  };

  // Handle barcode scan - show full item details
  const handleBarcodeScanned = (barcode: string) => {
    const findItemByBarcode = (items: OrganizerItem[]): OrganizerItem | null => {
      for (const item of items) {
        if (item.barcode === barcode) return item;
        const found = findItemByBarcode(item.children);
        if (found) return found;
      }
      return null;
    };

    const foundItem = findItemByBarcode(items);
    if (foundItem) {
      setSelectedItemForDetails(foundItem);
      setDetailsDialogOpen(true);
      toast({
        title: foundItem.type === 'location' ? 'Location Found!' : 'Item Found!',
        description: `${foundItem.name}`,
      });
    } else {
      toast({
        title: 'Not Found',
        description: 'No item or location found with this barcode',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Home className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">My Organizer</h1>
              <p className="text-xs text-muted-foreground">Track your belongings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allTags.length > 0 && (
              <Sheet open={tagSheetOpen} onOpenChange={setTagSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    title="Filter by tags"
                  >
                    <Tag className="h-5 w-5" />
                    {selectedTags.length > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {selectedTags.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter by Tags</SheetTitle>
                    <SheetDescription>
                      Select tags to filter items. Click on a tag to see all items with that tag.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {selectedTags.length > 0 && (
                      <div className="flex items-center justify-between pb-4 border-b">
                        <span className="text-sm font-medium">Active Filters ({selectedTags.length})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTags([])}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                    
                    <div className="space-y-6">
                      {allTags.map((tag) => {
                        const itemsWithTag = getItemsWithTag(tag);
                        const isSelected = selectedTags.includes(tag);
                        
                        return (
                          <div key={tag} className="space-y-2">
                            <div 
                              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                              onClick={() => handleToggleTag(tag)}
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant={isSelected ? 'default' : 'outline'}>
                                  {tag}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {itemsWithTag.length} item{itemsWithTag.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="text-xs text-primary font-medium">Active</span>
                              )}
                            </div>
                            
                            {isSelected && (
                              <div className="ml-4 space-y-2">
                                {itemsWithTag.map(({ item, path }) => (
                                  <div key={item.id} className="p-2 text-sm bg-muted rounded">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      📍 {path.slice(0, -1).join(' → ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setScannerOpen(true)}
              title="Scan barcode"
            >
              <ScanBarcode className="h-5 w-5" />
            </Button>
            {expiringItemsCount > 0 && (
              <Button 
                variant="ghost" 
                size="icon"
                className="relative"
                title={`${expiringItemsCount} items expiring soon`}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {expiringItemsCount}
                </span>
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Panel */}
        {items.length > 0 && <StatsPanel items={items} />}

        {/* Recent Activity */}
        {items.length > 0 && <RecentActivity items={items} />}

        {/* Breadcrumb */}
        {selectedItemId && <Breadcrumb items={items} currentItemId={selectedItemId} />}

        {/* Search & Controls Bar */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items, locations, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('tree')}
                title="Tree View"
              >
                <Network className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={() => {
                setParentIdForNew(null);
                setDefaultType('location');
                setEditingItem(null);
                setDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Location
            </Button>
          </div>

          {/* Tag Filter Pills */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground font-medium">Tags:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                  {selectedTags.includes(tag) && ' ✕'}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Items Display */}
        {filteredItems.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent">
              <Home className="h-10 w-10 text-accent-foreground" />
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              {searchQuery || selectedTags.length > 0 ? 'No items found' : 'Start Organizing'}
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              {searchQuery || selectedTags.length > 0
                ? 'Try a different search term or clear filters'
                : 'Create your first location (like a room or cupboard) to start tracking your belongings'}
            </p>
            {!searchQuery && selectedTags.length === 0 && (
              <Button
                onClick={() => {
                  setParentIdForNew(null);
                  setDefaultType('location');
                  setEditingItem(null);
                  setDialogOpen(true);
                }}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Your First Location
              </Button>
            )}
          </div>
        ) : viewMode === 'tree' ? (
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <ItemNode
                key={item.id}
                item={item}
                onAddChild={handleAddChild}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <ItemGrid
            items={filteredItems}
            onAddChild={handleAddChild}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onItemClick={setSelectedItemId}
          />
        ) : (
          <ItemList
            items={filteredItems}
            onAddChild={handleAddChild}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onItemClick={setSelectedItemId}
          />
        )}
      </main>

      {/* Add/Edit Dialog */}
      <AddItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        defaultType={defaultType}
        editData={editingItem ? {
          name: editingItem.name,
          description: editingItem.description || '',
          image: editingItem.image,
          physicalLocation: editingItem.physicalLocation,
          tags: editingItem.tags,
          expiryDate: editingItem.expiryDate,
          gpsLocation: editingItem.gpsLocation,
        } : undefined}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
      />

      {/* Barcode Scanner */}
      <BarcodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanSuccess={handleBarcodeScanned}
      />

      {/* Item Details Dialog */}
      <ItemDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        item={selectedItemForDetails}
      />
    </div>
  );
};

export default Index;
