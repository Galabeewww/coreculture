"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, User, LogOut, Menu, X, ChevronDown } from "lucide-react";
import { Category, Collection } from "@/types";
import { useRouter } from "next/navigation";

/**
 * Komponen: Navbar Publik
 *
 * Fitur Terkini:
 * - Pada tampilan publik (non-admin):
 *   * Keranjang belanja disembunyikan.
 *   * Tautan "ADMIN PANEL" disembunyikan dari navigasi teks.
 *   * Ikon orang (User) mengarahkan ke /admin/login.
 * - Ketika Admin Login:
 *   * Tautan "ADMIN PANEL" muncul di navigasi utama.
 *   * Status login terjaga saat berpindah antara toko publik dan admin.
 *   * Ikon orang berubah menjadi tombol LOGOUT langsung.
 * - Animasi halus untuk dropdown dan elemen interaktif.
 */
export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Status autentikasi admin
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Data kategori & koleksi dari API
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(true);

  // State dropdown desktop
  const [shopOpen, setShopOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  // Ref untuk deteksi klik di luar dropdown
  const shopRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);

  // Cek sesi login admin
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => {
        if (r.ok) setIsAdminLoggedIn(true);
        else setIsAdminLoggedIn(false);
      })
      .catch(() => setIsAdminLoggedIn(false));
  }, []);

  // Fetch data kategori & koleksi saat komponen di-mount
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
  }, []);

  // Tutup dropdown jika user klik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopOpen(false);
      if (colRef.current && !colRef.current.contains(e.target as Node)) setCollectionsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setIsAdminLoggedIn(false);
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
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
                  onClick={() => { setShopOpen(!shopOpen); setCollectionsOpen(false); }}
                  className="flex items-center gap-1 text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase cursor-pointer"
                >
                  SHOP <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${shopOpen ? "rotate-180 text-primary" : ""}`} />
                </button>
                {shopOpen && (
                  <div className="absolute top-full left-0 mt-3 w-56 bg-white border border-zinc-200 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                    <div className="px-4 py-2 border-b border-zinc-100">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Kategori Produk</span>
                    </div>
                    {loadingCategories ? (
                      <div className="px-4 py-3 text-[10px] text-zinc-400">Memuat...</div>
                    ) : !Array.isArray(categories) || categories.length === 0 ? (
                      <div className="px-4 py-3 text-[10px] text-zinc-500 font-semibold italic">Belum ada kategori</div>
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
                  onClick={() => { setCollectionsOpen(!collectionsOpen); setShopOpen(false); }}
                  className="flex items-center gap-1 text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase cursor-pointer"
                >
                  COLLECTIONS <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${collectionsOpen ? "rotate-180 text-primary" : ""}`} />
                </button>
                {collectionsOpen && (
                  <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-zinc-200 rounded-xl shadow-2xl py-2 animate-in fade-in slide-in-from-top-3 duration-200 z-50">
                    <div className="px-4 py-2 border-b border-zinc-100">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Koleksi Eksklusif</span>
                    </div>
                    {loadingCollections ? (
                      <div className="px-4 py-3 text-[10px] text-zinc-400">Memuat...</div>
                    ) : !Array.isArray(collections) || collections.length === 0 ? (
                      <div className="px-4 py-3 text-[10px] text-zinc-500 font-semibold italic">Belum ada koleksi</div>
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
              <Link href="/#katalog" className="text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase">
                NEW ARRIVALS
              </Link>

              {/* ADMIN PANEL (Hanya muncul jika Admin Logged In) */}
              {isAdminLoggedIn && (
                <Link
                  href="/admin"
                  className="text-xs font-black tracking-widest text-white bg-primary px-3 py-1.5 rounded-full hover:bg-primary-hover transition-all duration-300 uppercase shadow-sm transform hover:scale-105"
                >
                  ADMIN PANEL
                </Link>
              )}
            </div>
          </div>

          {/* Icons Desktop */}
          <div className="hidden md:flex items-center space-x-6 text-zinc-600">
            <button className="hover:text-primary cursor-pointer transition-transform duration-200 transform hover:scale-110" title="Cari">
              <Search className="h-5 w-5" />
            </button>

            {/* Ikon User / Admin Action */}
            {isAdminLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 transition-all duration-200 transform hover:scale-105 cursor-pointer bg-red-50 px-2.5 py-1 rounded-full border border-red-200"
                title="Logout Admin"
              >
                <LogOut className="h-4 w-4" /> LOGOUT
              </button>
            ) : (
              <Link
                href="/admin/login"
                className="hover:text-primary transition-transform duration-200 transform hover:scale-110 block"
                title="Admin Login"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
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
            <Link href="/#katalog" onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-black tracking-widest text-blue-800 hover:bg-zinc-50 uppercase">
              SALE!
            </Link>

            {/* Mobile: SHOP section */}
            <div className="px-3 py-2">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Shop by Category</span>
            </div>
            {loadingCategories ? (
              <div className="px-6 py-2 text-xs text-zinc-400">Memuat...</div>
            ) : !Array.isArray(categories) || categories.length === 0 ? (
              <div className="px-6 py-2 text-xs text-zinc-500 font-semibold italic">Belum ada kategori</div>
            ) : (
              categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} onClick={() => setIsOpen(false)}
                  className="block rounded-md px-6 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-primary">
                  {cat.name}
                </Link>
              ))
            )}

            {/* Mobile: COLLECTIONS section */}
            <div className="px-3 py-2 mt-2">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Collections</span>
            </div>
            {loadingCollections ? (
              <div className="px-6 py-2 text-xs text-zinc-400">Memuat...</div>
            ) : !Array.isArray(collections) || collections.length === 0 ? (
              <div className="px-6 py-2 text-xs text-zinc-500 font-semibold italic">Belum ada koleksi</div>
            ) : (
              collections.map((col) => (
                <Link key={col.id} href={`/collection/${col.slug}`} onClick={() => setIsOpen(false)}
                  className="block rounded-md px-6 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 hover:text-primary">
                  {col.name}
                </Link>
              ))
            )}
            <Link href="/collections" onClick={() => setIsOpen(false)}
              className="block rounded-md px-6 py-2 text-[10px] font-black text-primary uppercase tracking-wider hover:bg-zinc-50">
              Lihat Semua Koleksi →
            </Link>

            <Link href="/#katalog" onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-primary uppercase">
              NEW ARRIVALS
            </Link>

            {isAdminLoggedIn ? (
              <div className="pt-2 border-t border-zinc-100 space-y-2">
                <Link href="/admin" onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-black tracking-widest text-primary hover:bg-zinc-50 uppercase">
                  ADMIN PANEL →
                </Link>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="w-full text-left rounded-md px-3 py-2 text-base font-black tracking-widest text-red-600 hover:bg-red-50 uppercase cursor-pointer"
                >
                  LOGOUT ADMIN
                </button>
              </div>
            ) : (
              <Link href="/admin/login" onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-primary uppercase">
                ADMIN LOGIN
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
