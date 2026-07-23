"use client";

import { Product } from "@/types";
import { X, ShoppingBag, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatIDR } from "./ProductCard";
import Swal from "sweetalert2";

interface DetailModalProps {
  product: Product | null;
  categoryName: string;
  onClose: () => void;
}

/**
 * Komponen: Modal Detail Produk
 * 
 * Fitur:
 * - Slideshow interaktif untuk beralih gambar depan (imageFront) dan belakang (imageBack).
 * - Tombol navigasi (kiri & kanan) dan indikator titik halaman (dots indicator).
 * - Visualisasi yang sesuai dengan skema warna baru #002D72 (Primary Blue) dan #FFFFFF.
 * - Tombol Add to Bag interaktif.
 */
export default function DetailModal({ product, categoryName, onClose }: DetailModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0); // 0 untuk depan, 1 untuk belakang
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock === 0;
  const rawSlides = [product.imageFront, product.imageBack];
  const slides: string[] = rawSlides
    .filter((img): img is string => Boolean(img && img.trim() !== ""))
    .filter((img, idx, arr) => idx === 0 || img.trim() !== arr[0]?.trim());

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleAddToBag = () => {
    if (!selectedSize && product.sizes.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Ukuran",
        text: "Silakan pilih ukuran terlebih dahulu!",
        confirmButtonColor: "#002D72",
      });
      return;
    }
    Swal.fire({
      icon: "info",
      title: "Fitur Dalam Pengembangan 🚧",
      text: "Fitur Add to Bag sedang dalam tahap pengembangan. Silakan hubungi kami via WhatsApp untuk pemesanan langsung!",
      confirmButtonColor: "#002D72",
      confirmButtonText: "Mengerti",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-md animate-in fade-in duration-300">
      
      {/* Container Modal */}
      <div className="relative w-full max-w-4xl bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Tombol Tutup */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors duration-200 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Kolom Kiri: Slideshow Gambar */}
        <div className="w-full md:w-1/2 aspect-[4/5] md:aspect-auto md:h-auto bg-zinc-100 flex items-center relative overflow-hidden">
          
          {/* Gambar Slide Aktif */}
          <img
            src={slides[currentSlide]}
            alt={`${product.name} - View ${currentSlide + 1}`}
            className="w-full h-full object-cover transition-all duration-500 ease-in-out"
          />

          {/* Tombol Navigasi Slideshow jika ada lebih dari 1 gambar */}
          {slides.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-zinc-800 hover:bg-white hover:text-primary transition-all shadow-md cursor-pointer z-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-zinc-800 hover:bg-white hover:text-primary transition-all shadow-md cursor-pointer z-10"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Indikator Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 w-2.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? "bg-primary w-6" : "bg-zinc-400"
                    }`}
                  />
                ))}
              </div>

              {/* Tag Label Slide (Depan / Belakang) */}
              <div className="absolute top-4 left-4 bg-black/60 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded">
                {currentSlide === 0 ? "TAMPAK DEPAN" : "TAMPAK BELAKANG"}
              </div>
            </>
          )}
        </div>

        {/* Kolom Kanan: Detail & Aksi */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh] bg-white text-zinc-950">
          <div className="space-y-4">
            
            {/* Tag Kategori */}
            <span className="text-[10px] font-black tracking-widest text-primary uppercase bg-primary/10 px-2.5 py-1 rounded border border-primary/20">
              {categoryName}
            </span>

            {/* Nama Produk */}
            <h2 className="text-xl md:text-2xl font-black text-zinc-900 tracking-wide uppercase">
              {product.name}
            </h2>

            {/* Harga */}
            <p className="text-lg md:text-xl font-bold text-primary">
              {formatIDR(product.price)}
            </p>

            {/* Deskripsi */}
            <div className="border-t border-zinc-100 pt-4">
              <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase mb-2">Description</h4>
              <p className="text-sm text-zinc-600 leading-relaxed">
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
                <span className="text-orange-500 font-semibold flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="h-4 w-4" /> Stok Terbatas (Sisa {product.stock} pcs)
                </span>
              ) : (
                <span className="text-green-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" /> Stok Tersedia ({product.stock} pcs)
                </span>
              )}
            </div>

            {/* Pilihan Ukuran */}
            {!isOutOfStock && product.sizes.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase">Select Size</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[45px] h-[40px] px-3 text-xs font-bold rounded flex items-center justify-center border transition-all duration-200 cursor-pointer ${
                        selectedSize === size
                          ? "bg-primary text-white border-primary"
                          : "bg-zinc-50 text-zinc-800 border-zinc-200 hover:border-zinc-400"
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
          <div className="pt-8 border-t border-zinc-100 mt-6">
            {isAdded ? (
              <button
                disabled
                className="w-full bg-green-600 text-white font-black text-xs py-4 rounded uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300"
              >
                <CheckCircle className="h-4 w-4" /> ADDED TO BAG
              </button>
            ) : (
              <button
                onClick={handleAddToBag}
                disabled={isOutOfStock}
                className={`w-full font-black text-xs py-4 rounded uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                  isOutOfStock
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary-hover hover:scale-[1.01]"
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
