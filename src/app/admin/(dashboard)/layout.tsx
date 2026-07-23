"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, ShoppingBag, Bookmark, Camera, LogOut, ArrowLeft, Menu, X } from "lucide-react";

/**
 * Layout: Panel Admin Dashboard (Terproteksi)
 * Path: /admin/(dashboard)/*
 * 
 * Diperbarui ke tema warna baru: Canvas Putih dengan aksen #002D72 (Deep Blue).
 */
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cek otentikasi sesi admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          setAuthorized(true);
        } else {
          router.push("/admin/login");
        }
      } catch (err) {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Gagal melakukan logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-zinc-900">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="text-zinc-500 text-xs tracking-widest uppercase">Memverifikasi Otoritas Sesi...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  // Helper kelas navigasi aktif
  const linkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded text-xs font-black tracking-wider uppercase transition-all duration-200 ${
      isActive
        ? "bg-primary text-white glow-accent shadow-sm"
        : "text-zinc-600 hover:text-primary hover:bg-zinc-100"
    }`;
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { label: "Kategori", path: "/admin/categories", icon: <FolderKanban className="h-4.5 w-4.5" /> },
    { label: "Produk", path: "/admin/products", icon: <ShoppingBag className="h-4.5 w-4.5" /> },
    { label: "Koleksi", path: "/admin/collections", icon: <Bookmark className="h-4.5 w-4.5" /> },
    { label: "Photoshoot", path: "/admin/photoshoots", icon: <Camera className="h-4.5 w-4.5" /> },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row text-zinc-800">
      
      {/* 1. SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-50 border-r border-zinc-200 p-6 justify-between shrink-0">
        <div className="space-y-8">
          {/* Brand & Console Tag */}
          <div>
            <h1 className="text-lg font-black tracking-widest text-zinc-900 uppercase">CORECULTURE</h1>
            <span className="text-[9px] text-primary font-black tracking-wider uppercase">Console Admin</span>
          </div>

          {/* Menu Link */}
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} className={linkClass(item.path)}>
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Tombol Logout & Kembali */}
        <div className="space-y-4 pt-6 border-t border-zinc-200">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded text-xs font-bold tracking-wider text-zinc-500 hover:text-primary transition-colors uppercase"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Ke Toko Publik
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold tracking-wider text-red-600 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-all uppercase"
          >
            <LogOut className="h-4.5 w-4.5" />
            LOGOUT
          </button>
        </div>
      </aside>

      {/* 2. HEADER MOBILE */}
      <header className="md:hidden flex items-center justify-between bg-zinc-50 border-b border-zinc-200 p-4 shrink-0">
        <div>
          <h1 className="text-sm font-black tracking-widest text-zinc-900 uppercase">CORECULTURE</h1>
          <span className="text-[8px] text-primary font-black tracking-wider uppercase">Console Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-500 hover:text-primary focus:outline-none"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Menu Navigasi Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-50 border-b border-zinc-200 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={linkClass(item.path)}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <div className="border-t border-zinc-200 pt-4 mt-2 flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-primary uppercase"
            >
              <ArrowLeft className="h-4 w-4" /> Ke Toko Publik
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-600 hover:text-red-500 uppercase cursor-pointer"
            >
              <LogOut className="h-4 w-4" /> LOGOUT
            </button>
          </div>
        </div>
      )}

      {/* 3. AREA KONTEN UTAMA */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto max-h-[calc(100vh-60px)] md:max-h-screen bg-white">
        {children}
      </main>

    </div>
  );
}
