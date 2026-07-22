import { createClient } from "@supabase/supabase-js";
import { Category, Collection, Product, DashboardStats } from "@/types";
import { INITIAL_CATEGORIES, INITIAL_COLLECTIONS, INITIAL_PRODUCTS } from "./mockData";

// Ambil variabel environment Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Cek apakah kredensial Supabase tersedia
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Inisialisasi Supabase client (hanya jika dikonfigurasi)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// PENTING: Untuk keperluan serverless di Next.js, jika tidak memakai DB fisik,
// kita simpan state mock di variabel global agar tidak ke-reset saat hot reload di development lokal.
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
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
      
      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          createdAt: item.created_at
        }));
      }
    } catch (err) {
      console.error("Supabase exception (getCategories):", err);
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

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ name, slug }])
        .select()
        .single();

      if (!error && data) {
        const cat: Category = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          createdAt: data.created_at
        };
        store.categories.push(cat);
        return cat;
      }
      console.error("Supabase error (createCategory):", error);
    } catch (err) {
      console.error("Supabase exception (createCategory):", err);
    }
  }

  store.categories.push(newCategory);
  return newCategory;
}

export async function updateCategory(id: string, name: string): Promise<Category | null> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update({ name, slug })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const cat: Category = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          createdAt: data.created_at
        };
        const idx = store.categories.findIndex(c => c.id === id);
        if (idx !== -1) store.categories[idx] = cat;
        return cat;
      }
      console.error("Supabase error (updateCategory):", error);
    } catch (err) {
      console.error("Supabase exception (updateCategory):", err);
    }
  }

  const idx = store.categories.findIndex(c => c.id === id);
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
  if (supabase) {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);

      if (!error) {
        const idx = store.categories.findIndex(c => c.id === id);
        if (idx !== -1) store.categories.splice(idx, 1);
        store.products = store.products.filter(p => p.categoryId !== id);
        return true;
      }
      console.error("Supabase error (deleteCategory):", error);
    } catch (err) {
      console.error("Supabase exception (deleteCategory):", err);
    }
  }

  const idx = store.categories.findIndex(c => c.id === id);
  if (idx !== -1) {
    store.categories.splice(idx, 1);
    store.products = store.products.filter(p => p.categoryId !== id);
    return true;
  }
  return false;
}

// ==========================================
// DB LAYER: OPERASI KOLEKSI / COLLECTION (CRUD)
// ==========================================

export async function getCollections(): Promise<Collection[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("name", { ascending: true });
      
      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description || "",
          createdAt: item.created_at
        }));
      }
    } catch (err) {
      console.error("Supabase exception (getCollections):", err);
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

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("collections")
        .insert([{ name, slug, description }])
        .select()
        .single();

      if (!error && data) {
        const col: Collection = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          createdAt: data.created_at
        };
        store.collections.push(col);
        return col;
      }
      console.error("Supabase error (createCollection):", error);
    } catch (err) {
      console.error("Supabase exception (createCollection):", err);
    }
  }

  store.collections.push(newCollection);
  return newCollection;
}

export async function updateCollection(id: string, name: string, description: string): Promise<Collection | null> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("collections")
        .update({ name, slug, description })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const col: Collection = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          createdAt: data.created_at
        };
        const idx = store.collections.findIndex(c => c.id === id);
        if (idx !== -1) store.collections[idx] = col;
        return col;
      }
      console.error("Supabase error (updateCollection):", error);
    } catch (err) {
      console.error("Supabase exception (updateCollection):", err);
    }
  }

  const idx = store.collections.findIndex(c => c.id === id);
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
  if (supabase) {
    try {
      const { error } = await supabase
        .from("collections")
        .delete()
        .eq("id", id);

      if (!error) {
        const idx = store.collections.findIndex(c => c.id === id);
        if (idx !== -1) store.collections.splice(idx, 1);
        store.products = store.products.map(p => p.collectionId === id ? { ...p, collectionId: null } : p);
        return true;
      }
      console.error("Supabase error (deleteCollection):", error);
    } catch (err) {
      console.error("Supabase exception (deleteCollection):", err);
    }
  }

  const idx = store.collections.findIndex(c => c.id === id);
  if (idx !== -1) {
    store.collections.splice(idx, 1);
    store.products = store.products.map(p => p.collectionId === id ? { ...p, collectionId: null } : p);
    return true;
  }
  return false;
}

// ==========================================
// DB LAYER: OPERASI PRODUK (CRUD)
// ==========================================

export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: Number(item.price),
          stock: Number(item.stock),
          imageFront: item.image_front || item.image || "",
          imageBack: item.image_back || item.image || "",
          sizes: item.sizes || [],
          categoryId: item.category_id,
          collectionId: item.collection_id || null,
          createdAt: item.created_at
        }));
      }
    } catch (err) {
      console.error("Supabase exception (getProducts):", err);
    }
  }

  return store.products;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: Number(data.price),
          stock: Number(data.stock),
          imageFront: data.image_front || data.image || "",
          imageBack: data.image_back || data.image || "",
          sizes: data.sizes || [],
          categoryId: data.category_id,
          collectionId: data.collection_id || null,
          createdAt: data.created_at
        };
      }
    } catch (err) {
      console.error("Supabase exception (getProductById):", err);
    }
  }

  return store.products.find(p => p.id === id) || null;
}

export async function createProduct(productData: Omit<Product, "id" | "slug">): Promise<Product> {
  const id = `prod-${Date.now()}`;
  const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const newProduct: Product = {
    ...productData,
    id,
    slug,
    createdAt: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{
          name: productData.name,
          slug,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          image_front: productData.imageFront,
          image_back: productData.imageBack,
          sizes: productData.sizes,
          category_id: productData.categoryId,
          collection_id: productData.collectionId || null
        }])
        .select()
        .single();

      if (!error && data) {
        const prod: Product = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: Number(data.price),
          stock: Number(data.stock),
          imageFront: data.image_front,
          imageBack: data.image_back,
          sizes: data.sizes || [],
          categoryId: data.category_id,
          collectionId: data.collection_id || null,
          createdAt: data.created_at
        };
        store.products.unshift(prod);
        return prod;
      }
      console.error("Supabase error (createProduct):", error);
    } catch (err) {
      console.error("Supabase exception (createProduct):", err);
    }
  }

  store.products.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, "id">>): Promise<Product | null> {
  const slug = productData.name
    ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    : undefined;

  if (supabase) {
    try {
      const updatePayload: any = { ...productData };
      if (slug) updatePayload.slug = slug;
      
      if (productData.categoryId) {
        updatePayload.category_id = productData.categoryId;
        delete updatePayload.categoryId;
      }
      if (productData.collectionId !== undefined) {
        updatePayload.collection_id = productData.collectionId;
        delete updatePayload.collectionId;
      }
      if (productData.imageFront !== undefined) {
        updatePayload.image_front = productData.imageFront;
        delete updatePayload.imageFront;
      }
      if (productData.imageBack !== undefined) {
        updatePayload.image_back = productData.imageBack;
        delete updatePayload.imageBack;
      }

      const { data, error } = await supabase
        .from("products")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        const prod: Product = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: Number(data.price),
          stock: Number(data.stock),
          imageFront: data.image_front,
          imageBack: data.image_back,
          sizes: data.sizes || [],
          categoryId: data.category_id,
          collectionId: data.collection_id || null,
          createdAt: data.created_at
        };
        const idx = store.products.findIndex(p => p.id === id);
        if (idx !== -1) store.products[idx] = prod;
        return prod;
      }
      console.error("Supabase error (updateProduct):", error);
    } catch (err) {
      console.error("Supabase exception (updateProduct):", err);
    }
  }

  const idx = store.products.findIndex(p => p.id === id);
  if (idx !== -1) {
    store.products[idx] = {
      ...store.products[idx],
      ...productData,
      ...(slug ? { slug } : {})
    };
    return store.products[idx];
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (!error) {
        const idx = store.products.findIndex(p => p.id === id);
        if (idx !== -1) store.products.splice(idx, 1);
        return true;
      }
      console.error("Supabase error (deleteProduct):", error);
    } catch (err) {
      console.error("Supabase exception (deleteProduct):", err);
    }
  }

  const idx = store.products.findIndex(p => p.id === id);
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
  if (supabase) {
    try {
      const { count: catCount } = await supabase.from("categories").select("*", { count: "exact", head: true });
      const { count: prodCount } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: colCount } = await supabase.from("collections").select("*", { count: "exact", head: true });
      
      const { data: sumData } = await supabase.from("products").select("stock");
      const totalStock = sumData ? sumData.reduce((sum, item) => sum + (Number(item.stock) || 0), 0) : 0;

      return {
        totalCategories: catCount || store.categories.length,
        totalProducts: prodCount || store.products.length,
        totalStock: totalStock || store.products.reduce((acc, p) => acc + p.stock, 0),
        totalCollections: colCount || store.collections.length
      };
    } catch (err) {
      console.error("Supabase stats aggregation error, falling back to mock:", err);
    }
  }

  const totalStock = store.products.reduce((acc, p) => acc + p.stock, 0);
  return {
    totalCategories: store.categories.length,
    totalProducts: store.products.length,
    totalStock,
    totalCollections: store.collections.length
  };
}
