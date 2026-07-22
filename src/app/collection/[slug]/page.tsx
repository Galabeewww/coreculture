"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import DetailModal from "@/components/DetailModal";
import { Collection, Product, Category } from "@/types";
import { Search, X, ChevronRight, Bookmark } from "lucide-react";

/**
 * Halaman: Produk per Koleksi
 * Path: /collection/[slug]
 *
 * Menampilkan semua produk yang termasuk dalam satu koleksi tertentu.
 * Dilengkapi breadcrumb, info koleksi, pencarian, dan grid produk responsif.
 */
export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resProd, resCol, resCat] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/collections"),
          fetch("/api/categories"),
        ]);
        if (resProd.ok && resCol.ok && resCat.ok) {
          setProducts(await resProd.json());
          setCollections(await resCol.json());
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

  // Cari koleksi berdasarkan slug
  const collection = collections.find((c) => c.slug === slug);

  // Filter produk berdasarkan koleksi dan pencarian
  const filteredProducts = products
    .filter((p) => collection && p.collectionId === collection.id)
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

      {/* Header Koleksi */}
      {collection && (
        <header className="w-full py-16 bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/10">
                <Bookmark className="h-5 w-5 text-white/80" />
              </div>
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Koleksi Eksklusif</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-wider uppercase">
              {collection.name}
            </h1>
            <p className="text-white/70 text-xs md:text-sm mt-3 max-w-2xl leading-relaxed">
              {collection.description || "Koleksi eksklusif dari CORECULTURE."}
            </p>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-4">
              {filteredProducts.length} Produk dalam Koleksi ini
            </p>
          </div>
        </header>
      )}

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full flex-grow animate-fade-in-up">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/collections" className="hover:text-primary transition-colors">Collections</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary">{collection?.name || slug}</span>
        </div>

        {/* Pencarian */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder={`Cari di koleksi ${collection?.name || ""}...`}
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
            <p className="text-zinc-500 text-xs mt-4 uppercase tracking-widest animate-pulse">Memuat Produk Koleksi...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
            <Bookmark className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Belum Ada Produk</h3>
            <p className="text-xs text-zinc-400 mt-2">Koleksi ini belum memiliki produk terkait.</p>
            <Link href="/collections" className="mt-6 inline-block text-xs text-white bg-primary px-4 py-2 font-bold hover:bg-primary-hover transition-colors uppercase rounded">
              Lihat Koleksi Lain
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

      {/* Modal Detail */}
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
