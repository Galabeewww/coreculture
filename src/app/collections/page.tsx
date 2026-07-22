"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Collection, Product } from "@/types";
import { ArrowRight, Bookmark } from "lucide-react";

/**
 * Halaman: Daftar Semua Koleksi
 * Path: /collections
 *
 * Menampilkan semua koleksi dalam bentuk card besar
 * dengan nama, deskripsi, jumlah produk terkait, dan tombol navigasi.
 */
export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resCol, resProd] = await Promise.all([
          fetch("/api/collections"),
          fetch("/api/products"),
        ]);
        if (resCol.ok && resProd.ok) {
          setCollections(await resCol.json());
          setProducts(await resProd.json());
        }
      } catch (err) {
        console.error("Gagal memuat koleksi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hitung jumlah produk per koleksi
  const getProductCount = (collectionId: string) =>
    products.filter((p) => p.collectionId === collectionId).length;

  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-950">
      <Navbar />

      {/* Hero Section */}
      <header className="relative w-full py-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] bg-repeat" />
        </div>
        <div className="relative z-10 text-center space-y-4 px-4 animate-fade-in-up">
          <Bookmark className="h-10 w-10 text-white/60 mx-auto" />
          <h1 className="text-4xl md:text-5xl font-black tracking-wider text-white uppercase">
            OUR COLLECTIONS
          </h1>
          <p className="text-white/70 text-xs md:text-sm font-semibold tracking-widest max-w-lg mx-auto uppercase">
            Koleksi Eksklusif & Edisi Terbatas dari CORECULTURE
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full flex-grow">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
            <p className="text-zinc-500 text-xs mt-4 uppercase tracking-widest animate-pulse">Memuat Koleksi...</p>
          </div>
        ) : collections.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
            <Bookmark className="h-10 w-10 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">Belum Ada Koleksi</h3>
            <p className="text-xs text-zinc-400 mt-2">Koleksi eksklusif akan segera hadir.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((col) => {
              const count = getProductCount(col.id);
              return (
                <Link
                  key={col.id}
                  href={`/collection/${col.slug}`}
                  className="group block bg-white border border-zinc-200 rounded-xl p-8 hover:border-primary hover:shadow-lg transition-all duration-300 hover-lift animate-fade-in-up"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Bookmark className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  <h2 className="text-xl font-black text-zinc-900 tracking-wider uppercase mb-2 group-hover:text-primary transition-colors">
                    {col.name}
                  </h2>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-6 line-clamp-3">
                    {col.description || "Koleksi eksklusif CORECULTURE."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      {count} {count === 1 ? "Produk" : "Produk"}
                    </span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest group-hover:underline">
                      LIHAT KOLEKSI →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
