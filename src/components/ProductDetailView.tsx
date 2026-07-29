"use client";

import { Product } from "@/types";
import {
  ShoppingBag,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { formatIDR } from "./ProductCard";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface ProductDetailViewProps {
  product: Product;
  categoryName: string;
}

/**
 * Komponen: Tampilan Detail Produk (Inline Layout Referensi)
 *
 * Sesuai desain referensi:
 * - Kiri: Foto Produk besar.
 * - Kanan:
 *   - Tag "BEST SELLER" / Kategori
 *   - Judul Produk bergaris bawah
 *   - Harga IDR
 *   - Pilihan Ukuran (Tombol Lingkaran S, M, L, XL)
 *   - Pengatur Jumlah ([ - ] [ 1 ] [ + ])
 *   - Tombol "Add to Bag" (Pesan Fitur Dalam Pengembangan) & "Buy Now" (Hijau cerah)
 */
export default function ProductDetailView({
  product,
  categoryName,
}: ProductDetailViewProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes.length > 0 ? product.sizes[0] : "M",
  );
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stock === 0;

  // Slideshow gambar depan & belakang jika ada
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

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const nextVal = prev + delta;
      if (nextVal < 1) return 1;
      if (product.stock > 0 && nextVal > product.stock) return product.stock;
      return nextVal;
    });
  };

  // Pesan pemberitahuan fitur Add to Bag masih dalam tahap pengembangan
  const handleAddToBag = () => {
    if (isOutOfStock) return;
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

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const phoneNumber = "6281234567890";
    const msg = encodeURIComponent(
      `Halo CORECULTURE! Saya ingin membeli produk berikut:\n\n- Produk: ${product.name}\n- Ukuran: ${selectedSize}\n- Jumlah: ${quantity} pcs\n- Total Harga: ${formatIDR(
        product.price * quantity,
      )}\n\nMohon info pemesanan dan pengirimannya. Terima kasih!`,
    );
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, "_blank");
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Tombol Kembali */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-primary mb-8 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        KEMBALI KE KATALOG
      </button>

      {/* Grid Layout Referensi: 2 Kolom (Foto Kiri, Detail Kanan) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Kolom Kiri: Gambar Produk (Aspect ratio portrait) */}
        <div className="md:col-span-6 lg:col-span-5 bg-zinc-100 rounded-lg overflow-hidden relative group aspect-[3/4] border border-zinc-200 shadow-sm">
          <img
            src={slides[currentSlide]}
            alt={`${product.name} - Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover transition-all duration-500"
          />

          {/* Tombol Navigasi Slide jika ada lebih dari 1 foto */}
          {slides.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-zinc-800 hover:bg-white hover:text-primary transition-all shadow-md cursor-pointer z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 text-zinc-800 hover:bg-white hover:text-primary transition-all shadow-md cursor-pointer z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Indikator titik slide */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx
                        ? "bg-primary w-5"
                        : "bg-zinc-300 w-2"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Kolom Kanan: Informasi & Kontrol Pembelian */}
        <div className="md:col-span-6 lg:col-span-7 space-y-6 pt-2">
          {/* Badge Tag Best Seller / Kategori */}
          <div>
            <span className="text-xs font-black tracking-widest text-zinc-900 uppercase">
              {categoryName.toUpperCase() === "LAINNYA"
                ? "BEST SELLER"
                : categoryName.toUpperCase()}
            </span>
            <br />
            {/* Nama Produk dengan garis bawah biru bergaya referensi */}
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight pb-1 border-b-2 border-primary inline-block">
              {product.name}
            </h1>
          </div>

          {/* Harga Produk */}
          <div>
            <span className="text-2xl font-extrabold text-zinc-900 tracking-tight">
              {formatIDR(product.price)}
            </span>
          </div>

          {/* Deskripsi (jika ada) */}
          {product.description && (
            <p className="text-sm text-zinc-600 leading-relaxed max-w-xl">
              {product.description}
            </p>
          )}

          {/* Pilihan Ukuran (Select Size) */}
          {product.sizes.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wide block">
                Select Size
              </label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-black text-white shadow-md scale-105"
                          : "bg-white text-zinc-900 border border-zinc-300 hover:border-zinc-900"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pengatur Jumlah (Quantity Selector [ - ] [ 1 ] [ + ]) */}
          <div className="space-y-3 pt-2">
            <div className="inline-flex items-center border border-zinc-400 bg-zinc-100 rounded overflow-hidden">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isOutOfStock}
                className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-zinc-900 border-x border-zinc-400 bg-zinc-200/50">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={
                  isOutOfStock ||
                  (product.stock > 0 && quantity >= product.stock)
                }
                className="w-10 h-10 flex items-center justify-center text-zinc-800 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {product.stock > 0 && (
              <span className="block text-xs font-semibold text-zinc-500">
                Stok tersedia: {product.stock} pcs
              </span>
            )}
          </div>

          {/* Baris Tombol Aksi: Add to Bag & Buy Now */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 max-w-md">
            {/* Tombol Add to Bag */}
            <button
              onClick={handleAddToBag}
              disabled={isOutOfStock}
              className={`flex-1 py-3.5 px-6 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                isOutOfStock
                  ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  : "bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Add to Bag
            </button>

            {/* Tombol Buy Now (Hijau cerah) */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 py-3.5 px-6 rounded font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isOutOfStock
                  ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                  : "bg-[#00C985] hover:bg-[#00B074] text-white hover:shadow-lg hover:scale-[1.02]"
              }`}
            >
              {isOutOfStock ? "SOLD OUT" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
