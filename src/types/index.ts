export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageFront: string;
  imageBack?: string | null;
  sizes: string[];
  categoryId: string;
  collectionId?: string | null;
  createdAt?: string;
}

export interface PhotoshootEdition {
  id: string;
  name: string;        // e.g. "Vol.1", "Vol.2"
  isActive: boolean;   // edisi yang ditampilkan di homepage
  photos: PhotoshootImage[];
  createdAt?: string;
}

export interface PhotoshootImage {
  id: string;
  imageUrl: string;
  sortOrder: number;
  editionId: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  totalStock: number;
  totalCollections?: number;
  totalPhotoshoots?: number;
}
