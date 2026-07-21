"use client";

import { Product } from "@/types";
import { X, ShoppingBag, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { formatIDR } from "./ProductCard";

interface DetailModalProps {
  product: Product | null;
  categoryName: string;
  onClose: () => void;
}

/**
 * Komponen: Modal Detail Produk
 * 
 * Fitur:
 * - Tampilan tumpang tindih (overlay modal) dengan latar blur pekat.
 * - Galeri gambar portrait kiri dan informasi transaksi kanan (desktop).
 * - Selector ukuran varian fungsional (bisa diklik untuk memilih ukuran).
 * - Indikator level stok interaktif dengan peringatan sisa stok atau stok habis.
 * - Tombol fungsional "ADD TO BAG" dengan efek sukses mock.
 */
export default function DetailModal({ product, categoryName, onClose }: DetailModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  const handleAddToBag = () => {
    if (!selectedSize && product.sizes.length > 0) {
      alert("Silakan pilih ukuran terlebih dahulu!");
      return;
    }
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Container Modal */}
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Kolom Kiri: Gambar */}
        <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto md:h-auto bg-zinc-900 flex items-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Kolom Kanan: Detail & Aksi */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
          <div className="space-y-4">
            {/* Tag Kategori */}
            <span className="text-[10px] font-black tracking-widest text-accent uppercase bg-accent/10 px-2.5 py-1 rounded border border-accent/20">
              {categoryName}
            </span>

            {/* Nama Produk */}
            <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
              {product.name}
            </h2>

            {/* Harga */}
            <p className="text-lg md:text-xl font-bold text-gray-300">
              {formatIDR(product.price)}
            </p>

            {/* Deskripsi */}
            <div className="border-t border-zinc-900 pt-4">
              <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-2">Description</h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {product.description || "Tidak ada deskripsi untuk produk ini."}
              </p>
            </div>

            {/* Indikator Stok */}
            <div className="flex items-center gap-2 text-xs py-1">
              {isOutOfStock ? (
                <span className="text-red-500 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Stok Habis
                </span>
              ) : product.stock <= 15 ? (
                <span className="text-accent font-semibold flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="h-4 w-4" /> Stok Terbatas (Sisa {product.stock} pcs)
                </span>
              ) : (
                <span className="text-green-500 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Stok Tersedia ({product.stock} pcs)
                </span>
              )}
            </div>

            {/* Pilihan Ukuran */}
            {!isOutOfStock && product.sizes.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Select Size</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[45px] h-[40px] px-3 text-xs font-bold rounded flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                        selectedSize === size
                          ? "bg-white text-black border-white"
                          : "bg-zinc-900 text-gray-300 border-zinc-800 hover:border-zinc-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bagian Bawah: Tombol Belanja */}
          <div className="pt-8 border-t border-zinc-900 mt-6">
            {isAdded ? (
              <button
                disabled
                className="w-full bg-accent text-black font-black text-xs py-4 rounded uppercase tracking-widest flex items-center justify-center gap-2 glow-accent transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4" /> ADDED TO BAG
              </button>
            ) : (
              <button
                onClick={handleAddToBag}
                disabled={isOutOfStock}
                className={`w-full font-black text-xs py-4 rounded uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                  isOutOfStock
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-white text-black hover:bg-accent hover:text-black hover:scale-[1.01]"
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                {isOutOfStock ? "SOLD OUT" : "ADD TO BAG"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
