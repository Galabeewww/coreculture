import { createClient } from "@supabase/supabase-js";
import { Category, Product, DashboardStats } from "@/types";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "./mockData";

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
  products: Product[];
}

const globalForDb = global as unknown as { dbStore?: GlobalStorage };

if (!globalForDb.dbStore) {
  globalForDb.dbStore = {
    categories: [...INITIAL_CATEGORIES],
    products: [...INITIAL_PRODUCTS],
  };
}

const store = globalForDb.dbStore;

// ==========================================
// DB LAYER: OPERASI KATEGORI (CRUD)
// ==========================================

export async function getCategories(): Promise<Category[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    
    if (!error && data) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        createdAt: item.created_at
      }));
    }
    console.error("Supabase error (getCategories):", error);
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
    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, slug }])
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        createdAt: data.created_at
      };
    }
    console.error("Supabase error (createCategory):", error);
  }

  store.categories.push(newCategory);
  return newCategory;
}

export async function updateCategory(id: string, name: string): Promise<Category | null> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  
  if (supabase) {
    const { data, error } = await supabase
      .from("categories")
      .update({ name, slug })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        createdAt: data.created_at
      };
    }
    console.error("Supabase error (updateCategory):", error);
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
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (!error) return true;
    console.error("Supabase error (deleteCategory):", error);
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
// DB LAYER: OPERASI PRODUK (CRUD)
// ==========================================

export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        price: Number(item.price),
        stock: Number(item.stock),
        imageFront: item.image_front || item.image || "", // fallback ke field lama jika ada
        imageBack: item.image_back || item.image || "",  // fallback ke field lama jika ada
        sizes: item.sizes || [],
        categoryId: item.category_id,
        createdAt: item.created_at
      }));
    }
    console.error("Supabase error (getProducts):", error);
  }

  return store.products;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (supabase) {
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
        createdAt: data.created_at
      };
    }
    console.error("Supabase error (getProductById):", error);
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
        category_id: productData.categoryId
      }])
      .select()
      .single();

    if (!error && data) {
      return {
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
        createdAt: data.created_at
      };
    }
    console.error("Supabase error (createProduct):", error);
  }

  store.products.unshift(newProduct);
  return newProduct;
}

export async function updateProduct(id: string, productData: Partial<Omit<Product, "id">>): Promise<Product | null> {
  const slug = productData.name
    ? productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
    : undefined;

  if (supabase) {
    const updatePayload: any = { ...productData };
    if (slug) updatePayload.slug = slug;
    
    // Konversi field camelCase ke snake_case untuk Supabase PostgreSQL
    if (productData.categoryId) {
      updatePayload.category_id = productData.categoryId;
      delete updatePayload.categoryId;
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
      return {
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
        createdAt: data.created_at
      };
    }
    console.error("Supabase error (updateProduct):", error);
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
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (!error) return true;
    console.error("Supabase error (deleteProduct):", error);
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
      
      const { data: sumData } = await supabase.from("products").select("stock");
      const totalStock = sumData ? sumData.reduce((sum, item) => sum + (Number(item.stock) || 0), 0) : 0;

      return {
        totalCategories: catCount || 0,
        totalProducts: prodCount || 0,
        totalStock: totalStock
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
  };
}
