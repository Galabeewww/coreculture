"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import DetailModal from "@/components/DetailModal";
import { Category, Product } from "@/types";
import { Search, SlidersHorizontal, ArrowDownWideNarrow, X, RefreshCw } from "lucide-react";

/**
 * Halaman Utama (Homepage) & Katalog Publik
 * 
 * Fitur:
 * - Hero banner lookbook dengan gaya streetwear premium terinspirasi dari mockup Miracle Sport.
 * - Pencarian produk secara live (Live Search).
 * - Filter komprehensif berdasarkan Kategori, Rentang Harga, dan Varian Ukuran.
 * - Pengurutan harga (Termurah / Termahal).
 * - Integrasi modal detail produk interaktif.
 */
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // State pencarian dan filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number>(1000000); // Default max 1jt
  const [selectedSize, setSelectedSize] = useState("all");
  const [sortBy, setSortBy] = useState("latest"); // 'latest' | 'price-asc' | 'price-desc'
  const [showFilters, setShowFilters] = useState(false);

  // State untuk detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Ambil data dari API agar sinkron dengan operasi CRUD di admin panel secara realtime
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      if (resProd.ok && resCat.ok) {
        const dataProd = await resProd.json();
        const dataCat = await resCat.json();
        setProducts(dataProd);
        setCategories(dataCat);
      }
    } catch (err) {
      console.error("Gagal memuat data katalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Urutkan Produk
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
      
      const matchesPrice = product.price <= maxPrice;
      
      const matchesSize = selectedSize === "all" || product.sizes.includes(selectedSize);

      return matchesSearch && matchesCategory && matchesPrice && matchesSize;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
    });

  // Ambil nama kategori untuk modal detail
  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Fashion";
  };

  // Dapatkan daftar semua ukuran unik untuk filter size
  const allSizes = Array.from(
    new Set(products.flatMap((p) => p.sizes))
  ).filter((s) => s && s.trim() !== "");

  // Reset semua filter ke default
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMaxPrice(1000000);
    setSelectedSize("all");
    setSortBy("latest");
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />

      {/* 1. HERO BANNER SECTION (Inspirasi Lookbook Miracle Sport) */}
      <header className="relative w-full h-[85vh] overflow-hidden bg-zinc-950 flex items-center justify-center">
        {/* Background Streetwear Lookbook Image (Unsplash premium) */}
        <div className="absolute inset-0 bg-cover bg-center opacity-65 scale-100 animate-[pulse_10s_infinite]" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=1920')"
        }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

        {/* Hero Content */}
        <div className="relative z-10 text-center space-y-6 px-4">
          <span className="text-[11px] font-black tracking-[0.4em] text-accent uppercase animate-pulse">
            NEW DROP ARRIVAL
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase select-none">
            CORECULTURE SPORT
          </h1>
          <p className="text-gray-400 text-xs md:text-sm font-medium tracking-widest max-w-md mx-auto uppercase">
            Tersedia Sekarang • Rilisan Terbatas Koleksi Urbanwear
          </p>
          <div className="pt-4">
            <a
              href="#katalog"
              className="inline-block bg-white text-black font-black text-xs tracking-widest px-8 py-4 rounded hover:bg-accent hover:text-black transition-all duration-300 transform hover:scale-105"
            >
              BELANJA SEKARANG
            </a>
          </div>
        </div>
      </header>

      {/* 2. CATALOGUE SECTION */}
      <main id="katalog" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full scroll-mt-20">
        
        {/* Judul & Kontrol */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-900 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-wider uppercase">PRODUCT CATALOGUE</h2>
            <p className="text-xs text-gray-500 mt-1 uppercase">Menampilkan {filteredProducts.length} Koleksi</p>
          </div>
          
          {/* Tombol filter mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white border border-zinc-800 px-4 py-2.5 rounded bg-zinc-950 cursor-pointer transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? "TUTUP FILTER" : "FILTER & URUTKAN"}
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 rounded border border-zinc-800 text-gray-400 hover:text-white bg-zinc-950 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Panel Filter Expandable */}
        {showFilters && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
            {/* Filter Kategori */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 tracking-wider uppercase">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Ukuran */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 tracking-wider uppercase">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              >
                <option value="all">Semua Ukuran</option>
                {allSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Filter Harga Maksimal */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-black text-gray-500 tracking-wider uppercase">Max Price</label>
                <span className="text-xs text-accent font-bold">Rp {maxPrice.toLocaleString("id-ID")}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="1000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-accent bg-zinc-900 h-1 rounded-lg cursor-pointer"
              />
            </div>

            {/* Pengurutan (Sort) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 tracking-wider uppercase">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                >
                  <option value="latest">Rilisan Terbaru</option>
                  <option value="price-asc">Harga: Rendah ke Tinggi</option>
                  <option value="price-desc">Harga: Tinggi ke Rendah</option>
                </select>
                <button
                  onClick={resetFilters}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded px-3 py-2 text-xs text-red-400 hover:text-red-300 font-semibold cursor-pointer transition-colors"
                  title="Reset Filter"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Search Input */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Cari kaos, denim, aksesoris streetwear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3.5 border border-zinc-900 rounded bg-zinc-950 text-white placeholder-zinc-600 text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Loader Status */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-gray-500 text-xs mt-4 uppercase tracking-widest animate-pulse">Memuat Katalog CORECULTURE...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center border border-dashed border-zinc-900 rounded-lg bg-zinc-950/20">
            <SlidersHorizontal className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Koleksi Tidak Ditemukan</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto uppercase">Tidak ada produk yang cocok dengan kombinasi pencarian & filter Anda.</p>
            <button
              onClick={resetFilters}
              className="mt-6 text-xs text-black bg-white px-4 py-2 font-bold hover:bg-accent transition-colors uppercase rounded"
            >
              Bersihkan Filter
            </button>
          </div>
        ) : (
          /* Grid Produk */
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

      {/* 3. PRODUCT DETAIL MODAL */}
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
