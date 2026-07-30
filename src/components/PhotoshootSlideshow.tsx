"use client";

import { useEffect, useState } from "react";
import { PhotoshootEdition, PhotoshootImage } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Camera,
  AlertCircle,
} from "lucide-react";

export default function PhotoshootSlideshow() {
  const [edition, setEdition] = useState<PhotoshootEdition | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    fetch("/api/photoshoots/active")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.photos) {
          setEdition(data);
        } else {
          setEdition(null);
        }
      })
      .catch((err) => console.error("Gagal memuat photoshoot aktif:", err))
      .finally(() => setLoading(false));
  }, []);

  const photos: PhotoshootImage[] = edition?.photos || [];

  // Rotasi otomatis setiap 2.5 detik
  useEffect(() => {
    if (!isPlaying || photos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % photos.length);
    }, 2500); // 2.5 detik per foto

    return () => clearInterval(timer);
  }, [isPlaying, photos.length]);

  const handlePrev = () => {
    if (photos.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    if (photos.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  return (
    <section className="w-full bg-slate-900 text-white py-16 border-t border-slate-800 relative overflow-hidden">
      {/* Background Decorative Accent in Brand Color */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#002D72]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#002D72] text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3">
              <Camera size={14} />
              MODEL PHOTOSHOOT SLIDESHOW
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              CORECULTURE LOOKBOOK
              {edition && (
                <span className="text-base font-semibold px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                  {edition.name}
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Visualisasi koleksi streetwear model CORECULTURE
            </p>
          </div>

          {/* Slide Controls & Counter */}
          {photos.length > 0 && (
            <div className="flex items-center gap-4 self-start md:self-auto">
              <span className="text-xs font-mono tracking-widest text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
                SLIDE {String(currentSlide + 1).padStart(2, "0")} /{" "}
                {String(photos.length).padStart(2, "0")}
              </span>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
                title={isPlaying ? "Jeda Slideshow" : "Putar Slideshow"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="w-full h-96 bg-slate-800/50 rounded-2xl border border-slate-700 flex flex-col items-center justify-center space-y-3 animate-pulse">
            <Camera className="w-10 h-10 text-slate-500 animate-spin" />
            <p className="text-sm text-slate-400">Memuat photoshoot...</p>
          </div>
        )}

        {/* Empty State: Jika belum diunggah / edisi tidak aktif */}
        {!loading && photos.length === 0 && (
          <div className="w-full py-24 px-6 bg-slate-800/40 rounded-2xl border border-slate-700/80 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
            <div className="w-16 h-16 rounded-full bg-[#002D72]/20 border border-[#002D72]/40 flex items-center justify-center text-blue-400">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-xl font-bold text-white tracking-wide">
                Photoshoot belum diupload/update
              </h3>
              <p className="text-sm text-slate-400">
                Admin belum memilih edisi aktif atau mengunggah foto photoshoot
                untuk ditampilkan.
              </p>
            </div>
          </div>
        )}

        {/* Slideshow Display (Ukuran Asli & Tidak Terpotong) */}
        {!loading && photos.length > 0 && (
          <div
            className="relative w-full min-h-[420px] sm:min-h-[520px] md:min-h-[620px] max-h-[82vh] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center group"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
          >
            {/* Images */}
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                {/* Latar Belakang Blur Gambar Asli (Soft Ambient Glow) */}
                <img
                  src={photo.imageUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover opacity-25 blur-2xl scale-110 pointer-events-none"
                />

                {/* Foto Utama Mengikuti Ukuran Asli / Aspect Ratio Tanpa Terpotong */}
                <img
                  src={photo.imageUrl}
                  alt={`Photoshoot ${idx + 1}`}
                  className="relative z-10 max-h-[78vh] w-auto h-auto max-w-full object-contain mx-auto shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                />

                {/* Dynamic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#002D72]/80 via-transparent to-black/20 pointer-events-none z-15" />
              </div>
            ))}

            {/* Bottom Content Tag */}
            <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between pointer-events-none">
              <div className="space-y-1 pointer-events-auto">
                <span className="text-[10px] font-bold tracking-widest text-blue-300 bg-[#002D72]/85 px-3 py-1.5 rounded-lg uppercase backdrop-blur-md border border-blue-400/30 shadow-md inline-block">
                  {edition?.name} • CORECULTURE LOOKBOOK
                </span>
              </div>

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={handlePrev}
                    className="p-3 rounded-full bg-slate-900/85 hover:bg-[#002D72] text-white backdrop-blur-md border border-slate-700 hover:border-blue-400 transition-all shadow-lg active:scale-95 cursor-pointer"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-slate-900/85 hover:bg-[#002D72] text-white backdrop-blur-md border border-slate-700 hover:border-blue-400 transition-all shadow-lg active:scale-95 cursor-pointer"
                    aria-label="Foto Selanjutnya"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Pagination Dots (Top Right) */}
            {photos.length > 1 && (
              <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 shadow-md">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentSlide
                        ? "w-6 bg-blue-500"
                        : "w-2 bg-slate-600 hover:bg-slate-400"
                    }`}
                    aria-label={`Ke slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
