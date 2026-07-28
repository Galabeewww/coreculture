"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductDetailView from "@/components/ProductDetailView";
import { Product, Category } from "@/types";
import Link from "next/link";
import { use } from "react";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Halaman Detail Produk Publik (/product/[id])
 * Tampilan langsung (bukan Pop-up) sesuai layout referensi.
 */
export default function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch("/api/categories"),
        ]);

        if (resProd.ok) {
          const prodData = await resProd.json();
          setProduct(prodData);
        }
        if (resCat.ok) {
          setCategories(await resCat.json());
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const categoryName =
    categories.find((c) => c.id === product?.categoryId)?.name || "Lainnya";

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {loading ? (
          <div className="py-32 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">
            Memuat Detail Produk...
          </div>
        ) : !product ? (
          <div className="py-32 text-center space-y-4">
            <h2 className="text-xl font-bold text-zinc-800 uppercase tracking-wider">
              Produk Tidak Ditemukan
            </h2>
            <p className="text-xs text-zinc-500">
              Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.
            </p>
            <Link
              href="/#katalog"
              className="inline-block bg-primary text-white text-xs font-black px-6 py-3 rounded uppercase tracking-widest hover:bg-primary-hover transition-colors"
            >
              Lihat Katalog Produk
            </Link>
          </div>
        ) : (
          <ProductDetailView product={product} categoryName={categoryName} />
        )}
      </main>

      <Footer />
    </div>
  );
}
