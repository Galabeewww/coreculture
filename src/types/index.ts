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
  imageFront: string;      // Gambar bagian depan (Base64 atau URL)
  imageBack: string;       // Gambar bagian belakang (Base64 atau URL)
  sizes: string[];         // Contoh: ['S', 'M', 'L', 'XL']
  categoryId: string;
  collectionId?: string | null; // ID Koleksi opsional (bisa kosong / null)
  createdAt?: string;
}

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  totalStock: number;
  totalCollections?: number; // Total koleksi untuk dashboard admin
}
