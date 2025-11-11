export interface OrganizerItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId: string | null;
  children: OrganizerItem[];
  type: 'location' | 'item';
  createdAt: Date;
  updatedAt?: Date;
  physicalLocation?: string;
  barcode?: string;
  tags?: string[];
  expiryDate?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

export interface ItemFormData {
  name: string;
  description: string;
  image: File | null;
  type: 'location' | 'item';
  physicalLocation?: string;
  tags?: string[];
  expiryDate?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

export type ViewMode = 'tree' | 'grid' | 'list';
