"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import DetailModal from "@/components/DetailModal";
import PhotoshootSlideshow from "@/components/PhotoshootSlideshow";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Category, Product } from "@/types";
import {
  Search,
  SlidersHorizontal,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Halaman Utama (Homepage) & Katalog Publik
 *
 * Fitur:
 * - Tema warna Premium: #002D72 (Deep Blue) sebagai aksen primer dan #FFFFFF sebagai latar kanvas.
 * - Hero banner lookbook bernuansa streetwear kontras tinggi.
 * - Pencarian reaktif, filter kategori, harga maks, dan ukuran varian.
 * - Pagination otomatis jika produk > 8.
 */
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // State filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [selectedSize, setSelectedSize] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);

  // State modal detail
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // State pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 8;

  // State untuk animasi transisi tombol Belanja Sekarang
  const [isNavigating, setIsNavigating] = useState(false);

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
      console.error("Gagal memuat data katalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & Pengurutan
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;

      const matchesPrice = product.price <= maxPrice;

      const matchesSize =
        selectedSize === "all" || product.sizes.includes(selectedSize);

      return matchesSearch && matchesCategory && matchesPrice && matchesSize;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return (
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
      );
    });

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || "Fashion";
  };

  const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes))).filter(
    (s) => s && s.trim() !== "",
  );

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setMaxPrice(1000000);
    setSelectedSize("all");
    setSortBy("latest");
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );

  // Reset halaman saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, maxPrice, selectedSize, sortBy]);

  // Fungsi untuk handle klik Belanja Sekarang dengan delay & animasi
  const handleShopNow = () => {
    setIsNavigating(true);

    // Delay 300ms untuk memberikan efek transisi pada tombol sebelum mulai scroll
    setTimeout(() => {
      document.getElementById("katalog")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Reset state setelah scroll selesai (perkiraan 800ms)
      setTimeout(() => setIsNavigating(false), 800);
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-950 animate-page-enter">
      <Navbar />

      {/* 1. HERO BANNER */}
      <header className="relative w-full h-[85vh] overflow-hidden bg-zinc-900 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-100 scale-100 animate-[pulse_10s_infinite]"
          style={{
            backgroundImage: "url('/img/p.jpg')",
          }}
        />
        {/* Overlay gradasi biru-hitam premium */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-black/40 to-black/20" />

        <div className="relative z-10 text-center space-y-6 px-4 animate-fade-in-up">
          <span className="text-[11px] font-black tracking-[0.4em] text-white uppercase animate-pulse">
            NEW DROP ARRIVAL
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase select-none">
            CORECULTURE
          </h1>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase select-none mt-7">
            More than a sport. More than style. It’s who we are.
          </h1>
          <p className="text-white/80 text-xs md:text-sm font-semibold tracking-widest max-w-md mx-auto uppercase">
            Tersedia Sekarang • Rilisan Terbatas
          </p>
          <div className="pt-4">
            <button
              onClick={handleShopNow}
              disabled={isNavigating}
              className={`inline-block font-black text-xs tracking-widest px-8 py-4 rounded transition-all duration-300 transform shadow-md cursor-pointer ${
                isNavigating
                  ? "bg-zinc-800 text-white scale-95"
                  : "bg-white text-primary hover:bg-zinc-100 hover:scale-105"
              }`}
            >
              {isNavigating ? "MENGARAH KE KATALOG..." : "BELANJA SEKARANG"}
            </button>
          </div>
        </div>
      </header>

      {/* 2. CATALOGUE */}
      <main
        id="katalog"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full scroll-mt-20 animate-fade-in-up"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-200 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-wider uppercase">
              PRODUCT CATALOGUE
            </h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase">
              Menampilkan {filteredProducts.length} Koleksi
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs font-bold text-zinc-700 hover:text-primary border border-zinc-200 px-4 py-2.5 rounded bg-white cursor-pointer transition-colors shadow-sm"
            >
              <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
              {showFilters ? "TUTUP FILTER" : "FILTER & URUTKAN"}
            </button>
            <button
              onClick={fetchData}
              className="p-2.5 rounded border border-zinc-200 text-zinc-500 hover:text-primary bg-white cursor-pointer shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 tracking-wider uppercase">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-primary"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 tracking-wider uppercase">
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-primary"
              >
                <option value="all">Semua Ukuran</option>
                {allSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-black text-zinc-500 tracking-wider uppercase">
                  Max Price
                </label>
                <span className="text-xs text-primary font-bold">
                  Rp {maxPrice.toLocaleString("id-ID")}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="1000000"
                step="50000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary bg-zinc-200 h-1 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-500 tracking-wider uppercase">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-primary"
                >
                  <option value="latest">Rilisan Terbaru</option>
                  <option value="price-asc">Harga: Rendah ke Tinggi</option>
                  <option value="price-desc">Harga: Tinggi ke Rendah</option>
                </select>
                <button
                  onClick={resetFilters}
                  className="bg-white hover:bg-zinc-50 border border-zinc-200 rounded px-3 py-2 text-xs text-red-600 font-semibold cursor-pointer transition-colors"
                  title="Reset Filter"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Live Search */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Cari kaos, denim, aksesoris streetwear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3.5 border border-zinc-200 rounded bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-800 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Loader */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
            <p className="text-zinc-500 text-xs mt-4 uppercase tracking-widest animate-pulse">
              Memuat Katalog CORECULTURE...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
            <SlidersHorizontal className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
              Koleksi Tidak Ditemukan
            </h3>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto uppercase">
              Tidak ada produk yang cocok dengan kombinasi filter Anda.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 text-xs text-white bg-primary px-4 py-2 font-bold hover:bg-primary-hover transition-colors uppercase rounded"
            >
              Bersihkan Filter
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {paginatedProducts.map((product, idx) => (
                <div
                  key={product.id}
                  className={`animate-fade-in-up stagger-${(idx % 8) + 1}`}
                >
                  <ProductCard
                    product={product}
                    onOpenDetails={(p) => setSelectedProduct(p)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 pb-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Halaman Sebelumnya"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[40px] h-[40px] rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                        page === currentPage
                          ? "bg-primary text-white shadow-md"
                          : "bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  aria-label="Halaman Berikutnya"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Info jumlah produk */}
            <p className="text-center text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
              Menampilkan {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}–
              {Math.min(
                currentPage * PRODUCTS_PER_PAGE,
                filteredProducts.length,
              )}{" "}
              dari {filteredProducts.length} produk
            </p>
          </div>
        )}
      </main>

      {/* 3. CORECULTURE MODEL PHOTOSHOOT SLIDESHOW */}
      <PhotoshootSlideshow />

      {/* MODAL DETAIL */}
      {selectedProduct && (
        <DetailModal
          product={selectedProduct}
          categoryName={getCategoryName(selectedProduct.categoryId)}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* WhatsApp Floating Button */}
      {/* <WhatsAppButton /> */}

      <Footer />
    </div>
  );
}
