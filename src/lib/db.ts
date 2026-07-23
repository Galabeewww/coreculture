import { Category, Collection, Product, PhotoshootEdition, PhotoshootImage, DashboardStats } from "@/types";
import { INITIAL_CATEGORIES, INITIAL_COLLECTIONS, INITIAL_PRODUCTS } from "./mockData";
import prisma from "./prisma";

// Cek apakah DATABASE_URL dikonfigurasi di variabel lingkungan (.env)
export const isPrismaConfigured = Boolean(process.env.DATABASE_URL);

// In-Memory Storage Fallback (untuk dev tanpa DB fisik)
interface GlobalStorage {
  categories: Category[];
  collections: Collection[];
  products: Product[];
  photoshootEditions: PhotoshootEdition[];
}

const globalForDb = global as unknown as { dbStore?: GlobalStorage };

if (!globalForDb.dbStore) {
  globalForDb.dbStore = {
    categories: [...INITIAL_CATEGORIES],
    collections: [...INITIAL_COLLECTIONS],
    products: [...INITIAL_PRODUCTS],
    photoshootEditions: [],
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
      if (Array.isArray(data)) {
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
      if (Array.isArray(data)) {
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
      if (Array.isArray(data)) {
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
  // Tambahkan timestamp suffix ke slug untuk mencegah duplikat unique constraint
  const baseSlug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug}-${Date.now().toString(36)}`;
  const newProduct: Product = {
    ...productData,
    id,
    slug,
    imageBack: productData.imageBack || null,
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
          imageBack: productData.imageBack || null,
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
      // RE-THROW agar API mengembalikan error 500, bukan silent fallthrough ke in-memory
      throw err;
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
// DB LAYER: OPERASI PHOTOSHOOT EDITION (CRUD)
// ==========================================

export async function getPhotoshootEditions(): Promise<PhotoshootEdition[]> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.photoshootEdition.findMany({
        orderBy: { createdAt: "desc" },
        include: { photos: { orderBy: { sortOrder: "asc" } } },
      });
      return data.map((ed) => ({
        id: ed.id,
        name: ed.name,
        isActive: ed.isActive,
        createdAt: ed.createdAt.toISOString(),
        photos: ed.photos.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          sortOrder: p.sortOrder,
          editionId: p.editionId,
          createdAt: p.createdAt.toISOString(),
        })),
      }));
    } catch (err) {
      console.error("Prisma exception (getPhotoshootEditions):", err);
    }
  }
  return store.photoshootEditions || [];
}

export async function createPhotoshootEdition(name: string): Promise<PhotoshootEdition> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.photoshootEdition.create({
        data: { name },
        include: { photos: true },
      });
      const edition: PhotoshootEdition = {
        id: data.id,
        name: data.name,
        isActive: data.isActive,
        createdAt: data.createdAt.toISOString(),
        photos: [],
      };
      store.photoshootEditions.unshift(edition);
      return edition;
    } catch (err) {
      console.error("Prisma exception (createPhotoshootEdition):", err);
      throw err;
    }
  }

  const edition: PhotoshootEdition = {
    id: `edition-${Date.now()}`,
    name,
    isActive: false,
    photos: [],
    createdAt: new Date().toISOString(),
  };
  store.photoshootEditions.unshift(edition);
  return edition;
}

export async function updatePhotoshootEdition(id: string, name: string): Promise<PhotoshootEdition | null> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.photoshootEdition.update({
        where: { id },
        data: { name },
        include: { photos: { orderBy: { sortOrder: "asc" } } },
      });
      const updated: PhotoshootEdition = {
        id: data.id,
        name: data.name,
        isActive: data.isActive,
        createdAt: data.createdAt.toISOString(),
        photos: data.photos.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          sortOrder: p.sortOrder,
          editionId: p.editionId,
          createdAt: p.createdAt.toISOString(),
        })),
      };
      const idx = store.photoshootEditions.findIndex((e) => e.id === id);
      if (idx !== -1) store.photoshootEditions[idx] = updated;
      return updated;
    } catch (err) {
      console.error("Prisma exception (updatePhotoshootEdition):", err);
      throw err;
    }
  }

  const ed = store.photoshootEditions.find((e) => e.id === id);
  if (ed) {
    ed.name = name;
    return ed;
  }
  return null;
}

export async function updatePhotoshootImage(imageId: string, imageUrl: string): Promise<PhotoshootImage | null> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.photoshootImage.update({
        where: { id: imageId },
        data: { imageUrl },
      });
      const updated: PhotoshootImage = {
        id: data.id,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder,
        editionId: data.editionId,
        createdAt: data.createdAt.toISOString(),
      };
      for (const ed of store.photoshootEditions) {
        const pIdx = ed.photos.findIndex((p) => p.id === imageId);
        if (pIdx !== -1) ed.photos[pIdx] = updated;
      }
      return updated;
    } catch (err) {
      console.error("Prisma exception (updatePhotoshootImage):", err);
      throw err;
    }
  }

  for (const ed of store.photoshootEditions) {
    const p = ed.photos.find((item) => item.id === imageId);
    if (p) {
      p.imageUrl = imageUrl;
      return p;
    }
  }
  return null;
}

export async function deletePhotoshootEdition(id: string): Promise<boolean> {
  if (isPrismaConfigured) {
    try {
      await prisma.photoshootEdition.delete({ where: { id } });
      store.photoshootEditions = store.photoshootEditions.filter((e) => e.id !== id);
      return true;
    } catch (err) {
      console.error("Prisma exception (deletePhotoshootEdition):", err);
      throw err;
    }
  }
  const idx = store.photoshootEditions.findIndex((e) => e.id === id);
  if (idx !== -1) {
    store.photoshootEditions.splice(idx, 1);
    return true;
  }
  return false;
}

export async function setActiveEdition(id: string): Promise<PhotoshootEdition | null> {
  if (isPrismaConfigured) {
    try {
      // Nonaktifkan semua edisi lain
      await prisma.photoshootEdition.updateMany({ data: { isActive: false } });
      // Aktifkan edisi yang dipilih
      const data = await prisma.photoshootEdition.update({
        where: { id },
        data: { isActive: true },
        include: { photos: { orderBy: { sortOrder: "asc" } } },
      });
      // Sinkronkan in-memory store
      store.photoshootEditions = store.photoshootEditions.map((e) => ({
        ...e,
        isActive: e.id === id,
      }));
      return {
        id: data.id,
        name: data.name,
        isActive: data.isActive,
        createdAt: data.createdAt.toISOString(),
        photos: data.photos.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          sortOrder: p.sortOrder,
          editionId: p.editionId,
          createdAt: p.createdAt.toISOString(),
        })),
      };
    } catch (err) {
      console.error("Prisma exception (setActiveEdition):", err);
      throw err;
    }
  }

  store.photoshootEditions = store.photoshootEditions.map((e) => ({
    ...e,
    isActive: e.id === id,
  }));
  return store.photoshootEditions.find((e) => e.id === id) || null;
}

export async function addPhotoshootImages(editionId: string, imageUrls: string[]): Promise<PhotoshootImage[]> {
  if (isPrismaConfigured) {
    try {
      // Cek jumlah foto saat ini
      const count = await prisma.photoshootImage.count({ where: { editionId } });
      if (count + imageUrls.length > 10) {
        throw new Error(`Batas maksimal 10 foto per edisi. Saat ini: ${count}, ingin tambah: ${imageUrls.length}.`);
      }
      const createdPhotos: PhotoshootImage[] = [];
      for (let i = 0; i < imageUrls.length; i++) {
        const photo = await prisma.photoshootImage.create({
          data: {
            imageUrl: imageUrls[i],
            sortOrder: count + i,
            editionId,
          },
        });
        createdPhotos.push({
          id: photo.id,
          imageUrl: photo.imageUrl,
          sortOrder: photo.sortOrder,
          editionId: photo.editionId,
          createdAt: photo.createdAt.toISOString(),
        });
      }
      // Sinkronkan in-memory
      const edIdx = store.photoshootEditions.findIndex((e) => e.id === editionId);
      if (edIdx !== -1) {
        store.photoshootEditions[edIdx].photos.push(...createdPhotos);
      }
      return createdPhotos;
    } catch (err) {
      console.error("Prisma exception (addPhotoshootImages):", err);
      throw err;
    }
  }

  // In-memory fallback
  const edIdx = store.photoshootEditions.findIndex((e) => e.id === editionId);
  if (edIdx === -1) throw new Error("Edisi tidak ditemukan.");
  const edition = store.photoshootEditions[edIdx];
  if (edition.photos.length + imageUrls.length > 10) {
    throw new Error(`Batas maksimal 10 foto per edisi. Saat ini: ${edition.photos.length}, ingin tambah: ${imageUrls.length}.`);
  }
  const newPhotos: PhotoshootImage[] = imageUrls.map((url, i) => ({
    id: `img-${Date.now()}-${i}`,
    imageUrl: url,
    sortOrder: edition.photos.length + i,
    editionId,
    createdAt: new Date().toISOString(),
  }));
  edition.photos.push(...newPhotos);
  return newPhotos;
}

export async function deletePhotoshootImage(imageId: string): Promise<boolean> {
  if (isPrismaConfigured) {
    try {
      await prisma.photoshootImage.delete({ where: { id: imageId } });
      // Sinkronkan in-memory
      for (const ed of store.photoshootEditions) {
        ed.photos = ed.photos.filter((p) => p.id !== imageId);
      }
      return true;
    } catch (err) {
      console.error("Prisma exception (deletePhotoshootImage):", err);
      throw err;
    }
  }

  for (const ed of store.photoshootEditions) {
    const idx = ed.photos.findIndex((p) => p.id === imageId);
    if (idx !== -1) {
      ed.photos.splice(idx, 1);
      return true;
    }
  }
  return false;
}

export async function getActiveEditionPhotos(): Promise<PhotoshootEdition | null> {
  if (isPrismaConfigured) {
    try {
      const data = await prisma.photoshootEdition.findFirst({
        where: { isActive: true },
        include: { photos: { orderBy: { sortOrder: "asc" } } },
      });
      if (!data) return null;
      return {
        id: data.id,
        name: data.name,
        isActive: data.isActive,
        createdAt: data.createdAt.toISOString(),
        photos: data.photos.map((p) => ({
          id: p.id,
          imageUrl: p.imageUrl,
          sortOrder: p.sortOrder,
          editionId: p.editionId,
          createdAt: p.createdAt.toISOString(),
        })),
      };
    } catch (err) {
      console.error("Prisma exception (getActiveEditionPhotos):", err);
    }
  }

  const active = store.photoshootEditions.find((e) => e.isActive);
  return active || null;
}

// ==========================================
// DB LAYER: STATISTIK DASHBOARD (READ)
// ==========================================

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isPrismaConfigured) {
    try {
      const [catCount, prodCount, colCount, editionCount, stockAgg] = await Promise.all([
        prisma.category.count(),
        prisma.product.count(),
        prisma.collection.count(),
        prisma.photoshootEdition.count(),
        prisma.product.aggregate({ _sum: { stock: true } }),
      ]);

      return {
        totalCategories: catCount,
        totalProducts: prodCount,
        totalStock: stockAgg._sum.stock || 0,
        totalCollections: colCount,
        totalPhotoshoots: editionCount,
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
    totalPhotoshoots: store.photoshootEditions.length,
  };
}


