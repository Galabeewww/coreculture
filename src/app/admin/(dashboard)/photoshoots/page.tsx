"use client";

import { useEffect, useState } from "react";
import { PhotoshootEdition, PhotoshootImage } from "@/types";
import { Plus, Trash2, Upload, Camera, CheckCircle2, Layers, Play, Pause, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminPhotoshoots() {
  const [editions, setEditions] = useState<PhotoshootEdition[]>([]);
  const [selectedEditionId, setSelectedEditionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newEditionName, setNewEditionName] = useState("");
  const [isCreatingEdition, setIsCreatingEdition] = useState(false);

  // Preview slideshow state untuk edisi terpilih
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(true);

  const fetchEditions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/photoshoots/editions");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEditions(data);
          if (data.length > 0 && !selectedEditionId) {
            setSelectedEditionId(data[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Gagal memuat edisi photoshoot:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions();
  }, []);

  const selectedEdition = editions.find((e) => e.id === selectedEditionId) || editions[0];
  const photos = selectedEdition?.photos || [];

  // Slideshow auto play 1 detik untuk preview di admin
  useEffect(() => {
    if (!isPreviewPlaying || photos.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % photos.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [isPreviewPlaying, photos.length]);

  // Handle Tambah Edisi Baru
  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEditionName.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nama Edisi Wajib",
        text: "Silakan masukkan nama edisi (contoh: Vol.3).",
        confirmButtonColor: "#002D72",
      });
      return;
    }

    try {
      const res = await fetch("/api/photoshoots/editions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newEditionName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditions([data, ...editions]);
        setSelectedEditionId(data.id);
        setNewEditionName("");
        setIsCreatingEdition(false);
        Swal.fire({
          icon: "success",
          title: "Edisi Dibuat!",
          text: `Edisi "${data.name}" berhasil dibuat. Sekarang Anda dapat mengunggah 3-5 foto.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal membuat edisi." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Kesalahan!", text: "Koneksi ke server gagal." });
    }
  };

  // Handle Set Active Edition
  const handleSetActive = async (editionId: string, editionName: string) => {
    try {
      const res = await fetch(`/api/photoshoots/editions/${editionId}/active`, {
        method: "POST",
      });
      if (res.ok) {
        setEditions((prev) =>
          prev.map((e) => ({ ...e, isActive: e.id === editionId }))
        );
        Swal.fire({
          icon: "success",
          title: "Edisi Diaktifkan!",
          text: `Edisi "${editionName}" sekarang ditampilkan di beranda utama!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal mengaktifkan edisi." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Kesalahan!", text: "Gagal mengaktifkan edisi." });
    }
  };

  // Handle Upload Banyak Gambar (Multi-upload 3-5 foto sekaligus)
  const handleBatchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!selectedEdition) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Edisi Terlebih Dahulu",
        text: "Silakan buat atau pilih edisi (contoh: Vol.3) sebelum mengunggah gambar.",
        confirmButtonColor: "#002D72",
      });
      return;
    }

    const currentCount = photos.length;
    if (currentCount + files.length > 10) {
      Swal.fire({
        icon: "warning",
        title: "Batas Maksimal Terlampaui",
        text: `Maksimal 10 foto per edisi. Saat ini sudah ada ${currentCount} foto. Anda mencoba mengunggah ${files.length} foto.`,
        confirmButtonColor: "#002D72",
      });
      return;
    }

    setUploading(true);
    try {
      const imageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Coba upload ke /api/upload
        try {
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64 }),
          });
          if (uploadRes.ok) {
            const { url } = await uploadRes.json();
            imageUrls.push(url || base64);
          } else {
            imageUrls.push(base64);
          }
        } catch {
          imageUrls.push(base64);
        }
      }

      // Kirim ke API /api/photoshoots/editions/[id]/images
      const res = await fetch(`/api/photoshoots/editions/${selectedEdition.id}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrls }),
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh edisi
        await fetchEditions();
        Swal.fire({
          icon: "success",
          title: "Foto Berhasil Diunggah!",
          text: `${imageUrls.length} foto berhasil ditambahkan ke edisi "${selectedEdition.name}"!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal mengunggah foto." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Gagal!", text: "Gagal mengunggah foto." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Handle Hapus Single Foto
  const handleDeleteImage = async (imageId: string) => {
    const result = await Swal.fire({
      title: "Hapus Foto Ini?",
      text: "Foto akan dihapus dari edisi photoshoot ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#002D72",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/photoshoots/images/${imageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchEditions();
        Swal.fire({
          icon: "success",
          title: "Dihapus!",
          text: "Foto berhasil dihapus.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal menghapus foto." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Kesalahan!", text: "Gagal menghapus foto." });
    }
  };

  // Handle Hapus Entire Edition
  const handleDeleteEdition = async (editionId: string, name: string) => {
    const result = await Swal.fire({
      title: `Hapus Edisi "${name}"?`,
      text: "Seluruh foto dalam edisi ini akan ikut terhapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Edisi!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/photoshoots/editions/${editionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEditions(editions.filter((e) => e.id !== editionId));
        if (selectedEditionId === editionId) {
          const remaining = editions.filter((e) => e.id !== editionId);
          setSelectedEditionId(remaining.length > 0 ? remaining[0].id : "");
        }
        Swal.fire({
          icon: "success",
          title: "Edisi Dihapus!",
          text: `Edisi "${name}" berhasil dihapus.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal menghapus edisi." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Kesalahan!", text: "Gagal menghapus edisi." });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-[#002D72]" />
            Kelola Photoshoot Model & Edisi Lookbook
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Pilih edisi (Vol.1, Vol.2, Vol.3), unggah 3-5 foto per edisi (maksimal 10 foto), dan pilih edisi mana yang ditampilkan di beranda.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingEdition(!isCreatingEdition)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002D72] hover:bg-[#001D4A] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          {isCreatingEdition ? "Batal" : "Buat Edisi Baru (misal Vol.3)"}
        </button>
      </div>

      {/* Form Buat Edisi Baru */}
      {isCreatingEdition && (
        <form onSubmit={handleCreateEdition} className="bg-blue-50/60 border border-blue-200 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-extrabold text-[#002D72] uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} /> Buat Edisi Photoshoot Baru
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Contoh: Vol.3 (Fall/Winter 2026)"
              value={newEditionName}
              onChange={(e) => setNewEditionName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:border-[#002D72]"
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#002D72] text-white text-xs font-bold rounded-lg hover:bg-[#001D4A] transition-colors"
            >
              Simpan Edisi
            </button>
          </div>
        </form>
      )}

      {/* Tab/Pilihan Edisi */}
      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-500 animate-pulse">
          Memuat data edisi photoshoot...
        </div>
      ) : editions.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-sm font-bold text-amber-900">Belum Ada Edisi Photoshoot</h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Silakan klik tombol <strong>"Buat Edisi Baru"</strong> di atas untuk membuat edisi seperti <strong>Vol.1, Vol.2, atau Vol.3</strong> terlebih dahulu sebelum mengunggah gambar.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Baris Pilih Edisi yang Ditampilkan */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
            <span className="text-xs font-bold text-zinc-500 uppercase mr-2">PILIH EDISI:</span>
            {editions.map((ed) => {
              const isSelected = ed.id === selectedEdition?.id;
              return (
                <button
                  key={ed.id}
                  onClick={() => {
                    setSelectedEditionId(ed.id);
                    setPreviewIndex(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? "bg-[#002D72] text-white border-[#002D72] shadow-sm"
                      : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100"
                  }`}
                >
                  <Layers size={14} />
                  {ed.name} ({ed.photos.length}/10)
                  {ed.isActive && (
                    <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                      AKTIF BERANDA
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Edisi Terpilih Dashboard Controls */}
          {selectedEdition && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-6">
              {/* Header Status Edisi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-zinc-900">{selectedEdition.name}</h2>
                    {selectedEdition.isActive ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">
                        <CheckCircle2 size={14} /> Sedang Tampil di Beranda Utama
                      </span>
                    ) : (
                      <span className="bg-zinc-200 text-zinc-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        Edisi Cadangan (Tidak Aktif)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Jumlah foto: {photos.length} dari maksimal 10 foto
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!selectedEdition.isActive && (
                    <button
                      onClick={() => handleSetActive(selectedEdition.id, selectedEdition.name)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 size={15} />
                      Tampilkan Edisi Ini di Beranda
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteEdition(selectedEdition.id, selectedEdition.name)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 size={15} />
                    Hapus Edisi
                  </button>
                </div>
              </div>

              {/* Upload Section (Mendukung upload banyak foto 3-5 sekaligus) */}
              <div className="space-y-3 border-2 border-dashed border-zinc-300 hover:border-[#002D72] transition-colors p-6 rounded-xl text-center bg-zinc-50/50">
                <Upload className="w-8 h-8 text-[#002D72] mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-zinc-800">
                    Unggah Foto Edisi "{selectedEdition.name}"
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-lg mx-auto">
                    Pilih 3–5 gambar sekaligus dari komputer Anda. Batas maksimal {10 - photos.length} foto lagi dapat diunggah.
                  </p>
                </div>

                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002D72] hover:bg-[#001D4A] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm mt-2">
                  <Camera size={16} />
                  {uploading ? "Mengunggah Gambar..." : "Pilih Multiple Gambar (3–5 Foto)"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading || photos.length >= 10}
                    onChange={handleBatchFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Live Slideshow Preview Edisi (Rotasi 1 Detik) */}
              {photos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <h3 className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                      <Camera size={14} className="text-[#002D72]" /> Live Preview Slideshow (Rotasi 1s)
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-zinc-500">
                        {previewIndex + 1} / {photos.length}
                      </span>
                      <button
                        onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                        className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors"
                      >
                        {isPreviewPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full aspect-[21/9] bg-zinc-950 rounded-xl overflow-hidden shadow-md">
                    <img
                      src={photos[previewIndex]?.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded text-white text-[11px] font-bold">
                      {selectedEdition.name} • SLIDE {previewIndex + 1}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Galeri Foto Terunggah */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                  Daftar Foto Terunggah ({photos.length} / 10)
                </h3>

                {photos.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-400 border border-zinc-200 rounded-lg">
                    Photoshoot belum diupload/update untuk edisi ini.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {photos.map((photo, idx) => (
                      <div
                        key={photo.id}
                        className="group relative bg-zinc-100 border border-zinc-200 rounded-lg overflow-hidden aspect-square shadow-xs"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          #{idx + 1}
                        </div>

                        {/* Overlay Tombol Hapus Tempat Sampah */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteImage(photo.id)}
                            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform active:scale-95 shadow-lg"
                            title="Hapus foto ini"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
