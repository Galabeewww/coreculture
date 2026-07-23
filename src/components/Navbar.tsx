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
} from "lucide-react";
import { Category, Collection } from "@/types";
import { useRouter } from "next/navigation";

/**
 * Komponen: Navbar Publik
 *
 * Fitur:
 * - Pada tampilan publik (saat admin tidak login):
 *   * Tautan login admin dan opsi admin disembunyikan sepenuhnya dari Navbar dan Mobile Menu.
 *   * Admin hanya bisa login dengan mengakses URL /admin/login secara langsung.
 * - Ketika Admin Berhasil Login:
 *   * Tautan "ADMIN PANEL" muncul di navigasi utama.
 *   * Ikon logo orang (User) muncul dengan indikator hijau aktif.
 *   * Saat ikon logo orang diklik, muncul menu dropdown berisi opsi "Dashboard Admin" dan "Log Out".
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Ref untuk deteksi klik di luar dropdown
  const shopRef = useRef<HTMLDivElement>(null);
  const colRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

          {/* Icons Desktop */}
          <div className="hidden md:flex items-center space-x-6 text-zinc-600">
            <button
              className="hover:text-primary cursor-pointer transition-transform duration-200 transform hover:scale-110"
              title="Cari"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* User Icon & Admin Dropdown (Hanya Muncul Jika Admin Sudah Login) */}
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

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary focus:outline-none transition-colors"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
  );
}
