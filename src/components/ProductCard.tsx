"use client";

import { Product } from "@/types";
import { ArrowRight, Flame } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

// Helper untuk format mata uang Rupiah
export function formatIDR(price: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Komponen: Kartu Produk Katalog
 *
 * Fitur:
 * - Siluet streetwear dengan aspek rasio gambar portrait 3:4.
 * - Efek hover transisi premium: otomatis berganti dari gambar depan (imageFront)
 *   ke gambar belakang (imageBack) dengan animasi halus!
 * - Label stok menipis dan indicator sizes standar streetwear.
 */
export default function ProductCard({
  product,
  onOpenDetails,
}: ProductCardProps) {
  const isLowStock = product.stock > 0 && product.stock <= 15;
  const isOutOfStock = product.stock === 0;

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group relative cursor-pointer flex flex-col bg-white border border-zinc-200 overflow-hidden hover:border-zinc-400 transition-all duration-300 rounded-lg shadow-sm"
    >
      {/* Container Gambar (Posisi Relatif & Overlapping Grid) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100">
        {/* Gambar Depan (Utama) */}
        <img
          src={product.imageFront}
          alt={product.name}
          className="h-full w-full object-cover object-center absolute inset-0 transition-all duration-700 ease-in-out opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gambar Belakang (Tampil saat hover) */}
        {product.imageBack && (
          <img
            src={product.imageBack}
            alt={`${product.name} Back`}
            className="h-full w-full object-cover object-center absolute inset-0 transition-all duration-700 ease-in-out opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
            loading="lazy"
          />
        )}

        {/* Badge Stok Habis atau Stok Tipis */}
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 bg-black/85 text-red-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-red-500/25 z-10">
            OUT OF STOCK
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 left-3 bg-primary/85 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded border border-accent/25 flex items-center gap-1 glow-accent z-10">
            <Flame className="h-3 w-3 text-white animate-pulse" />
            ONLY {product.stock} LEFT
          </div>
        ) : null}

        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <span className="flex items-center gap-2 text-xs font-bold tracking-widest text-white bg-primary px-4 py-2.5 rounded uppercase transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            VIEW DETAILS <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      {/* Detail Konten */}
      <div className="flex flex-col flex-grow p-4 space-y-2 bg-white">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold tracking-wide text-zinc-900 group-hover:text-primary transition-colors duration-200 line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Harga */}
        <p className="text-sm font-semibold text-zinc-600">
          {formatIDR(product.price)}
        </p>

        {/* Varian Ukuran */}
        <div className="pt-2 flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-zinc-400 uppercase font-medium mr-1">
            SIZES:
          </span>
          {product.sizes.map((size) => (
            <span
              key={size}
              className="text-[9px] font-bold text-zinc-600 bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
