"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import DetailModal from "@/components/DetailModal";
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name || "Fashion";

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow animate-fade-in-up">
        {/* Breadcrumb navigasi */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/#katalog" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary">{category?.name || slug}</span>
        </div>

        {/* Header kategori */}
        <div className="border-b border-zinc-200 pb-6 mb-8">
          <h1 className="text-3xl font-black text-zinc-900 tracking-wider uppercase">
            {category?.name || slug}
          </h1>
          <p className="text-xs text-zinc-500 mt-2 uppercase">
            {loading ? "Memuat..." : `${filteredProducts.length} Produk Ditemukan`}
          </p>
        </div>

        {/* Pencarian dalam kategori */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder={`Cari di kategori ${category?.name || ""}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3.5 border border-zinc-200 rounded bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-800 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Grid Produk */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="text-zinc-500 text-xs mt-4 uppercase tracking-widest animate-pulse">Memuat Produk...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Belum Ada Produk</h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto">
              Kategori ini belum memiliki produk, atau tidak ada yang cocok dengan pencarian Anda.
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
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal Detail Produk */}
      {selectedProduct && (
        <DetailModal
          product={selectedProduct}
          categoryName={getCategoryName(selectedProduct.categoryId)}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <Footer />
    </div>
  );
}
