"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Category, Product } from "@/types";
import { Search, X, ChevronRight } from "lucide-react";

/**
 * Halaman: Produk per Kategori
 * Path: /category/[slug]
 *
 * Menampilkan semua produk yang termasuk dalam satu kategori tertentu.
 * Dilengkapi breadcrumb, pencarian dalam kategori, dan grid produk responsif.
 */
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch produk dan kategori dari API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resProd, resCat] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);
        if (resProd.ok && resCat.ok) {
          setProducts(await resProd.json());
          setCategories(await resCat.json());
        }
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cari kategori yang cocok dengan slug URL
  const category = categories.find((c) => c.slug === slug);

  // Filter produk berdasarkan kategori dan pencarian
  const filteredProducts = products
    .filter((p) => category && p.categoryId === category.id)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            BERANDA
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-zinc-400">KATEGORI</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary font-black">
            {category ? category.name : slug}
          </span>
        </nav>

        {/* Header Kategori & Baris Pencarian */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-200 pb-6 mb-10">
          <div>
            <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-2.5 py-1 rounded border border-primary/20">
              Koleksi Kategori
            </span>
            <h1 className="text-3xl font-black tracking-widest text-zinc-900 uppercase mt-2">
              {category ? category.name : "Kategori Tidak Ditemukan"}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 uppercase font-semibold">
              {filteredProducts.length} Produk Tersedia
            </p>
          </div>

          {/* Search bar dalam kategori */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari dalam kategori ini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-8 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-primary transition-all placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Konten Grid Produk */}
        {loading ? (
          <div className="py-32 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
            Memuat Produk Kategori...
          </div>
        ) : !category ? (
          <div className="py-32 text-center space-y-4">
            <h2 className="text-xl font-bold text-zinc-800 uppercase tracking-wider">
              Kategori Tidak Ditemukan
            </h2>
            <p className="text-xs text-zinc-400">
              Kategori dengan alamat ini tidak ada atau telah dihapus.
            </p>
            <Link
              href="/"
              className="inline-block text-xs text-white bg-primary px-6 py-3 font-black uppercase tracking-widest rounded hover:bg-primary-hover transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-32 text-center space-y-3 bg-zinc-50 rounded-xl border border-zinc-200/60 p-8">
            <p className="text-sm font-bold text-zinc-600 uppercase tracking-wider">
              Tidak Ada Produk
            </p>
            <p className="text-xs text-zinc-400">
              {searchQuery
                ? `Tidak ada produk yang cocok dengan pencarian "${searchQuery}".`
                : "Belum ada produk dalam kategori ini."}
            </p>
            <Link href="/" className="mt-6 inline-block text-xs text-white bg-primary px-4 py-2 font-bold hover:bg-primary-hover transition-colors uppercase rounded">
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
