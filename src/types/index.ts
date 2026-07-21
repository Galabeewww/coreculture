export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image: string; // URL gambar produk
  sizes: string[]; // Contoh: ['S', 'M', 'L', 'XL']
  categoryId: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalCategories: number;
  totalProducts: number;
  totalStock: number;
}
