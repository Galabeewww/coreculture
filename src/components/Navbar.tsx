"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Category, Collection, Product } from "@/types";
import { useRouter } from "next/navigation";
import { formatIDR } from "./ProductCard";
import DetailModal from "./DetailModal";

/**
 * Komponen: Navbar Publik
 *
 * Fitur:
 * - Pencarian Langsung Real-Time (Search Modal Overlay).
 * - SHOP & COLLECTIONS dropdown.
 * - Sesi Admin login & indikator status.
 */
export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Status autentikasi admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Data kategori, koleksi & produk dari API
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);

  // State dropdown desktop
  const [shopOpen, setShopOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // State Fitur Search Modal & Modal Detail Produk
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Ref untuk deteksi klik di luar dropdown & input search
  const shopRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cek sesi login admin
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => {
        if (r.ok) setIsAdminLoggedIn(true);
        else setIsAdminLoggedIn(false);
      })
      .catch(() => setIsAdminLoggedIn(false));
  }, []);

  // Fetch data kategori, koleksi, dan produk saat komponen di-mount
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        else setCategories([]);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));

    fetch("/api/collections")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCollections(data);
        else setCollections([]);
      })
      .catch(() => setCollections([]))
      .finally(() => setLoadingCollections(false));

    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      })
      .catch(() => setProducts([]));
  }, []);

  // Focus otomatis pada input pencarian saat modal search dibuka
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  // Tutup dropdown jika user klik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
      if (colRef.current && !colRef.current.contains(e.target as Node)) {
        setCollectionsOpen(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAdminLoggedIn(false);
      setUserMenuOpen(false);
      router.push("/#katalog");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter pencarian real-time (produk, kategori, koleksi)
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return false;
    const query = searchQuery.toLowerCase();
    const catName = categories.find((c) => c.id === p.categoryId)?.name || "";
    const colName = collections.find((c) => c.id === p.collectionId)?.name || "";
    return (
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      catName.toLowerCase().includes(query) ||
      colName.toLowerCase().includes(query)
    );
  });

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return false;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredCollections = collections.filter((c) => {
    if (!searchQuery.trim()) return false;
    return c.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50 w-full transition-all duration-300 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className="text-2xl font-black tracking-widest text-primary hover:opacity-80 transition-all duration-300 transform hover:scale-105 inline-block"
              >
                CORECULTURE
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {/* SALE! */}
                <Link
                  href="/#katalog"
                  className="text-xs font-black tracking-widest text-blue-800 hover:text-blue-500 transition-colors duration-200 uppercase"
                >
                  SALE!
                </Link>

                {/* SHOP Dropdown */}
                <div ref={shopRef} className="relative">
                  <button
                    onClick={() => {
                      setShopOpen(!shopOpen);
                      setCollectionsOpen(false);
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase cursor-pointer"
                  >
                    SHOP{" "}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${shopOpen ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>
                  {shopOpen && (
                    <div className="absolute top-full left-0 mt-3 w-56 bg-white border border-zinc-200 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                          Kategori Produk
                        </span>
                      </div>
                      {loadingCategories ? (
                        <div className="px-4 py-3 text-[10px] text-zinc-400">
                          Memuat...
                        </div>
                      ) : !Array.isArray(categories) ||
                        categories.length === 0 ? (
                        <div className="px-4 py-3 text-[10px] text-zinc-500 font-semibold italic">
                          Belum ada kategori
                        </div>
                      ) : (
                        categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            onClick={() => setShopOpen(false)}
                            className="block px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-primary transition-all duration-150 transform hover:translate-x-1"
                          >
                            {cat.name}
                          </Link>
                        ))
                      )}
                      <div className="border-t border-zinc-100 mt-1 pt-1">
                        <Link
                          href="/#katalog"
                          onClick={() => setShopOpen(false)}
                          className="block px-4 py-2.5 text-[10px] font-black text-primary uppercase tracking-wider hover:bg-zinc-50"
                        >
                          Lihat Semua Produk →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* COLLECTIONS Dropdown */}
                <div ref={colRef} className="relative">
                  <button
                    onClick={() => {
                      setCollectionsOpen(!collectionsOpen);
                      setShopOpen(false);
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase cursor-pointer"
                  >
                    COLLECTIONS{" "}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-300 ${collectionsOpen ? "rotate-180 text-primary" : ""}`}
                    />
                  </button>
                  {collectionsOpen && (
                    <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-zinc-200 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                          Koleksi Eksklusif
                        </span>
                      </div>
                      {loadingCollections ? (
                        <div className="px-4 py-3 text-[10px] text-zinc-400">
                          Memuat...
                        </div>
                      ) : !Array.isArray(collections) ||
                        collections.length === 0 ? (
                        <div className="px-4 py-3 text-[10px] text-zinc-500 font-semibold italic">
                          Belum ada koleksi
                        </div>
                      ) : (
                        collections.map((col) => (
                          <Link
                            key={col.id}
                            href={`/collection/${col.slug}`}
                            onClick={() => setCollectionsOpen(false)}
                            className="block px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-primary transition-all duration-150 transform hover:translate-x-1"
                          >
                            {col.name}
                          </Link>
                        ))
                      )}
                      <div className="border-t border-zinc-100 mt-1 pt-1">
                        <Link
                          href="/collections"
                          onClick={() => setCollectionsOpen(false)}
                          className="block px-4 py-2.5 text-[10px] font-black text-primary uppercase tracking-wider hover:bg-zinc-50"
                        >
                          Lihat Semua Koleksi →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* NEW ARRIVALS */}
                <Link
                  href="/#katalog"
                  className="text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase"
                >
                  NEW ARRIVALS
                </Link>

                {/* ADMIN PANEL (Hanya muncul jika Admin Berhasil Logged In) */}
                {isAdminLoggedIn && (
                  <Link
                    href="/admin"
                    className="text-xs font-black tracking-widest text-white bg-primary px-3 py-1.5 rounded-full hover:bg-primary-hover transition-all duration-300 uppercase shadow-sm transform hover:scale-105 animate-fade-in"
                  >
                    ADMIN PANEL
                  </Link>
                )}
              </div>
            </div>

            {/* Icons Desktop & Search Trigger */}
            <div className="hidden md:flex items-center space-x-6 text-zinc-600">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-primary hover:border-primary cursor-pointer transition-all duration-200 hover:scale-105"
                title="Pencarian Langsung"
              >
                <Search className="h-4 w-4" />
                <span className="text-[11px] font-medium pr-2">Cari produk...</span>
              </button>

              {/* User Icon & Admin Dropdown */}
              {isAdminLoggedIn && (
                <div ref={userMenuRef} className="relative animate-fade-in">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setShopOpen(false);
                      setCollectionsOpen(false);
                    }}
                    className="p-2 rounded-full transition-all duration-200 transform hover:scale-110 cursor-pointer block relative text-primary bg-primary/10 border border-primary/20"
                    title="Menu Admin"
                  >
                    <User className="h-5 w-5" />
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-52 bg-white border border-zinc-200 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                      <div className="px-4 py-2 border-b border-zinc-100 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <div>
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest block">
                            ADMIN LOGGED IN
                          </span>
                          <span className="text-[10px] font-bold text-zinc-600 block">
                            Administrator
                          </span>
                        </div>
                      </div>
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 hover:text-primary transition-colors"
                      >
                        Dashboard Admin
                      </Link>
                      <div className="border-t border-zinc-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Actions (Search + Menu) */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-zinc-600 hover:text-primary transition-colors"
                title="Cari Produk"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary focus:outline-none transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-b border-zinc-200 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-1 px-2 pb-6 pt-4 sm:px-3">
              <Link
                href="/#katalog"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-black tracking-widest text-blue-800 hover:bg-zinc-50 uppercase"
              >
                SALE!
              </Link>

              {/* Mobile: SHOP section */}
              <div className="px-3 py-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  Shop by Category
                </span>
              </div>
              {loadingCategories ? (
                <div className="px-6 py-2 text-xs text-zinc-400">Memuat...</div>
              ) : !Array.isArray(categories) || categories.length === 0 ? (
                <div className="px-6 py-2 text-xs text-zinc-500 font-semibold italic">
                  Belum ada kategori
                </div>
              ) : (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-6 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-primary"
                  >
                    {cat.name}
                  </Link>
                ))
              )}

              {/* Mobile: COLLECTIONS section */}
              <div className="px-3 py-2 mt-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  Collections
                </span>
              </div>
              {loadingCollections ? (
                <div className="px-6 py-2 text-xs text-zinc-400">Memuat...</div>
              ) : !Array.isArray(collections) || collections.length === 0 ? (
                <div className="px-6 py-2 text-xs text-zinc-500 font-semibold italic">
                  Belum ada koleksi
                </div>
              ) : (
                collections.map((col) => (
                  <Link
                    key={col.id}
                    href={`/collection/${col.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-6 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-primary"
                  >
                    {col.name}
                  </Link>
                ))
              )}
              <Link
                href="/collections"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-6 py-2 text-[10px] font-black text-primary uppercase tracking-wider hover:bg-zinc-50"
              >
                Lihat Semua Koleksi →
              </Link>

              <Link
                href="/#katalog"
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-primary uppercase"
              >
                NEW ARRIVALS
              </Link>

              {/* Opsi Admin hanya muncul jika admin berhasil login */}
              {isAdminLoggedIn && (
                <div className="pt-2 border-t border-zinc-100 space-y-2">
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-black tracking-widest text-primary hover:bg-zinc-50 uppercase"
                  >
                    ADMIN PANEL →
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left rounded-md px-3 py-2 text-base font-black tracking-widest text-red-600 hover:bg-red-50 uppercase cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" /> LOG OUT ADMIN
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ==============================================
          MODAL OVERLAY: FITUR PENCARIAN LANGSUNG (SEARCH)
          ============================================== */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-900/80 backdrop-blur-md flex items-start justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Header Modal Search */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center gap-3 bg-zinc-50">
              <Search className="w-5 h-5 text-primary shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, kategori, atau edisi koleksi..."
                className="w-full bg-transparent text-sm sm:text-base font-medium text-zinc-900 placeholder-zinc-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-zinc-400 hover:text-zinc-700 font-bold px-2 py-1 bg-zinc-200/70 rounded-full"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 rounded-full bg-zinc-200 hover:bg-zinc-300 text-zinc-600 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Results */}
            <div className="p-6 overflow-y-auto space-y-6">
              {!searchQuery.trim() ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                    Ketik nama pakaian, baju, celana, atau koleksi untuk mencari
                  </p>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase mr-1">
                        Pencarian Populer:
                      </span>
                      {categories.slice(0, 5).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSearchQuery(cat.name)}
                          className="px-3 py-1 bg-zinc-100 hover:bg-primary/10 hover:text-primary border border-zinc-200 rounded-full text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Kategori & Koleksi Cocok */}
                  {(filteredCategories.length > 0 || filteredCollections.length > 0) && (
                    <div className="space-y-2 pb-4 border-b border-zinc-100">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Kategori & Koleksi Terkait
                      </span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {filteredCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-1.5"
                          >
                            Kategori: {cat.name} <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                        {filteredCollections.map((col) => (
                          <Link
                            key={col.id}
                            href={`/collection/${col.slug}`}
                            onClick={() => setIsSearchOpen(false)}
                            className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded-lg hover:bg-blue-800 hover:text-white transition-colors flex items-center gap-1.5"
                          >
                            Koleksi: {col.name} <ArrowRight className="w-3 h-3" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hasil Produk */}
                  <div>
                    <div className="flex items-center justify-between pb-3">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Hasil Produk ({filteredProducts.length})
                      </span>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <div className="py-12 text-center text-xs text-zinc-500 font-semibold italic">
                        Tidak ada produk yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filteredProducts.map((prod) => {
                          const catName =
                            categories.find((c) => c.id === prod.categoryId)?.name ||
                            "Katalog";

                          return (
                            <div
                              key={prod.id}
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSelectedProduct(prod);
                              }}
                              className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-200 hover:border-primary hover:shadow-md transition-all cursor-pointer group bg-zinc-50/50 hover:bg-white"
                            >
                              <div className="w-14 h-16 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                                <img
                                  src={prod.imageFront}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-black text-primary uppercase tracking-widest block">
                                  {catName}
                                </span>
                                <h4 className="text-xs font-bold text-zinc-900 truncate group-hover:text-primary transition-colors">
                                  {prod.name}
                                </h4>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs font-bold text-zinc-800">
                                    {formatIDR(prod.price)}
                                  </span>
                                  {prod.stock === 0 ? (
                                    <span className="text-[9px] font-black text-red-500 uppercase">
                                      Habis
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-green-600">
                                      Stok {prod.stock}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Produk saat diklik dari hasil pencarian */}
      {selectedProduct && (
        <DetailModal
          product={selectedProduct}
          categoryName={
            categories.find((c) => c.id === selectedProduct.categoryId)?.name ||
            "Katalog"
          }
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
