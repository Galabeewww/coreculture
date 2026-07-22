import { Category, Collection, Product, DashboardStats } from "@/types";
import { INITIAL_CATEGORIES, INITIAL_COLLECTIONS, INITIAL_PRODUCTS } from "./mockData";
import prisma from "./prisma";

// Cek apakah DATABASE_URL dikonfigurasi di variabel lingkungan (.env)
export const isPrismaConfigured = Boolean(process.env.DATABASE_URL);

// In-Memory Storage Fallback (untuk dev tanpa DB fisik)
interface GlobalStorage {
  categories: Category[];
  collections: Collection[];
  products: Product[];
}

const globalForDb = global as unknown as { dbStore?: GlobalStorage };

if (!globalForDb.dbStore) {
  globalForDb.dbStore = {
    categories: [...INITIAL_CATEGORIES],
    collections: [...INITIAL_COLLECTIONS],
    products: [...INITIAL_PRODUCTS],
  };
}

const store = globalForDb.dbStore;

// ==========================================
// DB LAYER: OPERASI KATEGORI (CRUD)
// ==========================================

export async function getCategories(): Promise<Category[]> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });
      if (data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          createdAt: item.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.error("Prisma exception (getCategories):", err);
    }
  }

  return store.categories;
}

export async function createCategory(name: string): Promise<Category> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const newCategory: Category = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    createdAt: new Date().toISOString(),
  };

  if (isPrismaConfigured) {
    try {
      const data = await prisma.category.create({
        data: { name, slug },
      });
      const cat: Category = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        createdAt: data.createdAt.toISOString(),
      };
      store.categories.push(cat);
      return cat;
    } catch (err) {
      console.error("Prisma exception (createCategory):", err);
    }
  }

  store.categories.push(newCategory);
  return newCategory;
}

export async function updateCategory(id: string, name: string): Promise<Category | null> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  if (isPrismaConfigured) {
    try {
      const data = await prisma.category.update({
        where: { id },
        data: { name, slug },
      });
      const cat: Category = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        createdAt: data.createdAt.toISOString(),
      };
      const idx = store.categories.findIndex((c) => c.id === id);
      if (idx !== -1) store.categories[idx] = cat;
      return cat;
    } catch (err) {
      console.error("Prisma exception (updateCategory):", err);
    }
  }

  const idx = store.categories.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.categories[idx] = {
      ...store.categories[idx],
      name,
      slug,
    };
    return store.categories[idx];
  }
  return null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isPrismaConfigured) {
    try {
      await prisma.category.delete({ where: { id } });
      const idx = store.categories.findIndex((c) => c.id === id);
      if (idx !== -1) store.categories.splice(idx, 1);
      store.products = store.products.filter((p) => p.categoryId !== id);
      return true;
    } catch (err) {
      console.error("Prisma exception (deleteCategory):", err);
    }
  }

  const idx = store.categories.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.categories.splice(idx, 1);
    store.products = store.products.filter((p) => p.categoryId !== id);
    return true;
  }
  return false;
}

// ==========================================
// DB LAYER: OPERASI KOLEKSI / COLLECTION (CRUD)
// ==========================================

export async function getCollections(): Promise<Collection[]> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.collection.findMany({
        orderBy: { name: "asc" },
      });
      if (data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description || "",
          createdAt: item.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.error("Prisma exception (getCollections):", err);
    }
  }

  return store.collections;
}

export async function createCollection(name: string, description: string): Promise<Collection> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const newCollection: Collection = {
    id: `col-${Date.now()}`,
    name,
    slug,
    description,
    createdAt: new Date().toISOString(),
  };

  if (isPrismaConfigured) {
    try {
      const data = await prisma.collection.create({
        data: { name, slug, description },
      });
      const col: Collection = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        createdAt: data.createdAt.toISOString(),
      };
      store.collections.push(col);
      return col;
    } catch (err) {
      console.error("Prisma exception (createCollection):", err);
    }
  }

  store.collections.push(newCollection);
  return newCollection;
}

export async function updateCollection(id: string, name: string, description: string): Promise<Collection | null> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  if (isPrismaConfigured) {
    try {
      const data = await prisma.collection.update({
        where: { id },
        data: { name, slug, description },
      });
      const col: Collection = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        createdAt: data.createdAt.toISOString(),
      };
      const idx = store.collections.findIndex((c) => c.id === id);
      if (idx !== -1) store.collections[idx] = col;
      return col;
    } catch (err) {
      console.error("Prisma exception (updateCollection):", err);
    }
  }

  const idx = store.collections.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.collections[idx] = {
      ...store.collections[idx],
      name,
      slug,
      description,
    };
    return store.collections[idx];
  }
  return null;
}

export async function deleteCollection(id: string): Promise<boolean> {
  if (isPrismaConfigured) {
    try {
      await prisma.collection.delete({ where: { id } });
      const idx = store.collections.findIndex((c) => c.id === id);
      if (idx !== -1) store.collections.splice(idx, 1);
      store.products = store.products.map((p) => (p.collectionId === id ? { ...p, collectionId: null } : p));
      return true;
    } catch (err) {
      console.error("Prisma exception (deleteCollection):", err);
    }
  }

  const idx = store.collections.findIndex((c) => c.id === id);
  if (idx !== -1) {
    store.collections.splice(idx, 1);
    store.products = store.products.map((p) => (p.collectionId === id ? { ...p, collectionId: null } : p));
    return true;
  }
  return false;
}

// ==========================================
// DB LAYER: OPERASI PRODUK (CRUD)
// ==========================================

export async function getProducts(): Promise<Product[]> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: Number(item.price),
          stock: Number(item.stock),
          imageFront: item.imageFront,
          imageBack: item.imageBack,
          sizes: item.sizes,
          categoryId: item.categoryId,
          collectionId: item.collectionId,
          createdAt: item.createdAt.toISOString(),
        }));
      }
    } catch (err) {
      console.error("Prisma exception (getProducts):", err);
    }
  }

  return store.products;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.product.findUnique({
        where: { id },
      });
      if (data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: Number(data.price),
          stock: Number(data.stock),
          imageFront: data.imageFront,
          imageBack: data.imageBack,
          sizes: data.sizes,
          categoryId: data.categoryId,
          collectionId: data.collectionId,
          createdAt: data.createdAt.toISOString(),
        };
      }
    } catch (err) {
      console.error("Prisma exception (getProductById):", err);
    }
  }

  return store.products.find((p) => p.id === id) || null;
}

export async function createProduct(productData: Omit<Product, "id" | "slug">): Promise<Product> {
  const id = `prod-${Date.now()}`;
  const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const newProduct: Product = {
    ...productData,
    id,
    slug,
    createdAt: new Date().toISOString(),
  };

  if (isPrismaConfigured) {
    try {
      const data = await prisma.product.create({
        data: {
          name: productData.name,
          slug,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          imageFront: productData.imageFront,
          imageBack: productData.imageBack,
          sizes: productData.sizes,
          categoryId: productData.categoryId,
          collectionId: productData.collectionId || null,
        },
      });
      const prod: Product = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        imageFront: data.imageFront,
        imageBack: data.imageBack,
        sizes: data.sizes,
        categoryId: data.categoryId,
        collectionId: data.collectionId,
        createdAt: data.createdAt.toISOString(),
      };
      store.products.unshift(prod);
      return prod;
    } catch (err) {
      console.error("Prisma exception (createProduct):", err);
    }
  }

  store.products.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, "id">>): Promise<Product | null> {
  const slug = productData.name
    ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    : undefined;

  if (isPrismaConfigured) {
    try {
      const updateData: any = { ...productData };
      if (slug) updateData.slug = slug;

      const data = await prisma.product.update({
        where: { id },
        data: updateData,
      });

      const prod: Product = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        imageFront: data.imageFront,
        imageBack: data.imageBack,
        sizes: data.sizes,
        categoryId: data.categoryId,
        collectionId: data.collectionId,
        createdAt: data.createdAt.toISOString(),
      };
      const idx = store.products.findIndex((p) => p.id === id);
      if (idx !== -1) store.products[idx] = prod;
      return prod;
    } catch (err) {
      console.error("Prisma exception (updateProduct):", err);
    }
  }

  const idx = store.products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.products[idx] = {
      ...store.products[idx],
      ...productData,
      ...(slug ? { slug } : {}),
    };
    return store.products[idx];
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isPrismaConfigured) {
    try {
      await prisma.product.delete({ where: { id } });
      const idx = store.products.findIndex((p) => p.id === id);
      if (idx !== -1) store.products.splice(idx, 1);
      return true;
    } catch (err) {
      console.error("Prisma exception (deleteProduct):", err);
    }
  }

  const idx = store.products.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.products.splice(idx, 1);
    return true;
  }
  return false;
}

// ==========================================
// DB LAYER: STATISTIK DASHBOARD (READ)
// ==========================================

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isPrismaConfigured) {
    try {
      const [catCount, prodCount, colCount, stockAgg] = await Promise.all([
        prisma.category.count(),
        prisma.product.count(),
        prisma.collection.count(),
        prisma.product.aggregate({ _sum: { stock: true } }),
      ]);

      return {
        totalCategories: catCount,
        totalProducts: prodCount,
        totalStock: stockAgg._sum.stock || 0,
        totalCollections: colCount,
      };
    } catch (err) {
      console.error("Prisma stats error, falling back to mock:", err);
    }
  }

  const totalStock = store.products.reduce((acc, p) => acc + p.stock, 0);
  return {
    totalCategories: store.categories.length,
    totalProducts: store.products.length,
    totalStock,
    totalCollections: store.collections.length,
  };
}
