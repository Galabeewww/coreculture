"use client";

import { useEffect, useState } from "react";
import { FolderKanban, ShoppingBag, Layers, Bookmark, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { DashboardStats, Product } from "@/types";
import { formatIDR } from "@/components/ProductCard";
import Link from "next/link";

/**
 * Halaman Utama: Dashboard Admin
 * Path: /admin
 * 
 * Diperbarui ke tema warna baru: Canvas Putih dengan aksen #002D72 (Deep Blue).
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCategories: 0,
    totalProducts: 0,
    totalStock: 0,
    totalCollections: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ configured: false, type: "" });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resStats, resProds] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/products"),
        ]);

        if (resStats.ok && resProds.ok) {
          const statsData = await resStats.json();
          const prodsData: Product[] = await resProds.json();
          
          setStats(statsData);
          setRecentProducts(prodsData.slice(0, 5));
        }

        const resCheck = await fetch("/api/categories");
        if (resCheck.ok) {
          setDbStatus({
            configured: true,
            type: "Hybrid Database (Local State / Supabase Ready)"
          });
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        <p className="text-zinc-500 text-xs mt-4 uppercase tracking-widest animate-pulse">Menyiapkan Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-2xl font-black text-zinc-900 tracking-wider uppercase">DASHBOARD</h2>
        <p className="text-xs text-zinc-500 mt-1 uppercase">Ringkasan operasional katalog CORECULTURE</p>
      </div>

      {/* Indikator Status Database */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-white border border-zinc-200 text-primary">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider">Status Infrastruktur Database</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">Operasi CRUD hibrida diaktifkan secara otomatis.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-zinc-200 text-xs shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-zinc-700 font-bold text-[10px] uppercase tracking-wider">{dbStatus.type}</span>
        </div>
      </div>

      {/* Grid Card Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card Kategori */}
        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg space-y-4 hover:border-zinc-300 transition-colors shadow-sm hover-lift animate-fade-in-up">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">Total Kategori</span>
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-zinc-900">{stats.totalCategories}</span>
            <Link href="/admin/categories" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase">
              KATEGORI <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card Produk */}
        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg space-y-4 hover:border-zinc-300 transition-colors shadow-sm hover-lift animate-fade-in-up stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">Total Produk</span>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-zinc-900">{stats.totalProducts}</span>
            <Link href="/admin/products" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase">
              PRODUK <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Card Total Stok */}
        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg space-y-4 hover:border-zinc-300 transition-colors shadow-sm hover-lift animate-fade-in-up stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">Total Unit Stok</span>
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-zinc-900">{stats.totalStock}</span>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Unit Barang</span>
          </div>
        </div>

        {/* Card Koleksi */}
        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-lg space-y-4 hover:border-zinc-300 transition-colors shadow-sm hover-lift animate-fade-in-up stagger-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">Total Koleksi</span>
            <Bookmark className="h-5 w-5 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-zinc-900">{stats.totalCollections || 0}</span>
            <Link href="/admin/collections" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase">
              KOLEKSI <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Tabel Rilisan Produk Terbaru */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/50">
          <h3 className="text-xs font-black text-zinc-800 tracking-widest uppercase">RILISAN PRODUK TERBARU</h3>
          <Link href="/admin/products" className="text-[10px] font-black text-zinc-500 hover:text-primary uppercase tracking-widest">
            LIHAT SEMUA →
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 uppercase tracking-wider">
            Belum ada produk terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-black uppercase tracking-wider bg-zinc-50">
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Varian Ukuran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {recentProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-10 w-8 rounded overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                        <img src={prod.imageFront} alt={prod.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="font-bold text-zinc-900">{prod.name}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 font-semibold">
                      {formatIDR(prod.price)}
                    </td>
                    <td className="px-6 py-4">
                      {prod.stock === 0 ? (
                        <span className="text-red-500 font-black uppercase text-[10px]">HABIS</span>
                      ) : (
                        <span className="text-zinc-700 font-bold">{prod.stock} Pcs</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {prod.sizes.map((s) => (
                          <span key={s} className="bg-zinc-100 border border-zinc-200 text-[9px] px-1.5 py-0.5 rounded text-zinc-600 font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
