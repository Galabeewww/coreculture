"use client";

import { useEffect, useState } from "react";
import { PhotoshootEdition, PhotoshootImage } from "@/types";
import {
  Plus,
  Trash2,
  Upload,
  Camera,
  CheckCircle2,
  Layers,
  Play,
  Pause,
  AlertCircle,
  Edit2,
  X,
  Save,
  ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminPhotoshoots() {
  const [editions, setEditions] = useState<PhotoshootEdition[]>([]);
  const [selectedEditionId, setSelectedEditionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form buat edisi baru
  const [newEditionName, setNewEditionName] = useState("");
  const [isCreatingEdition, setIsCreatingEdition] = useState(false);

  // Form edit nama edisi
  const [editingEditionId, setEditingEditionId] = useState<string | null>(null);
  const [editEditionName, setEditEditionName] = useState("");

  // Explicit Draft Files Upload State (Tidak langsung upload, harus tekan tombol Upload)
  const [draftFiles, setDraftFiles] = useState<File[]>([]);
  const [draftPreviews, setDraftPreviews] = useState<string[]>([]);

  // State untuk ganti/edit foto individual
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementPreview, setReplacementPreview] = useState<string>("");

  // Preview slideshow state
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

  const selectedEdition =
    editions.find((e) => e.id === selectedEditionId) || editions[0];
  const photos = selectedEdition?.photos || [];

  // Slideshow auto play 1 detik untuk preview
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
          text: `Edisi "${data.name}" berhasil dibuat. Pilih berkas lalu tekan tombol Upload untuk menambahkan foto.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal membuat edisi.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Koneksi ke server gagal.",
      });
    }
  };

  // Handle Edit Nama Edisi
  const handleUpdateEditionName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEditionId || !editEditionName.trim()) return;

    try {
      const res = await fetch(`/api/photoshoots/editions/${editingEditionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editEditionName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditions((prev) =>
          prev.map((item) =>
            item.id === editingEditionId ? { ...item, name: data.name } : item,
          ),
        );
        setEditingEditionId(null);
        Swal.fire({
          icon: "success",
          title: "Diperbarui!",
          text: "Nama edisi berhasil diperbarui.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal memperbarui edisi.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Gagal memperbarui nama edisi.",
      });
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
          prev.map((e) => ({ ...e, isActive: e.id === editionId })),
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
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal mengaktifkan edisi.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Gagal mengaktifkan edisi.",
      });
    }
  };

  // Step 1 Flow Upload: Pilih file ke DRAFT dengan kompresi client-side
  const handleSelectDraftFiles = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!selectedEdition) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Edisi Terlebih Dahulu",
        text: "Silakan pilih edisi dari dropdown sebelum memilih gambar.",
        confirmButtonColor: "#002D72",
      });
      return;
    }

    const currentCount = photos.length + draftFiles.length;
    if (currentCount + files.length > 10) {
      Swal.fire({
        icon: "warning",
        title: "Batas Maksimal Terlampaui",
        text: `Maksimal 10 foto per edisi. Saat ini sudah ada ${photos.length} foto terunggah & ${draftFiles.length} draft.`,
        confirmButtonColor: "#002D72",
      });
      return;
    }

    try {
      const { compressImageFile } = await import("@/lib/imageCompressor");
      const compressedPreviews = await Promise.all(
        files.map((file) => compressImageFile(file, 1600, 0.85)),
      );

      setDraftFiles((prev) => [...prev, ...files]);
      setDraftPreviews((prev) => [...prev, ...compressedPreviews]);
    } catch (err) {
      console.error("Gagal mengompresi gambar:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memproses Gambar",
        text: "Terjadi kesalahan saat memproses gambar.",
      });
    }

    e.target.value = "";
  };

  const removeDraftFile = (index: number) => {
    setDraftFiles((prev) => prev.filter((_, i) => i !== index));
    setDraftPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Step 2 Flow Upload: Tekan Tombol Upload / Simpan untuk Mengunggah ke Server
  const handleExecuteBatchUpload = async () => {
    if (draftFiles.length === 0 || !selectedEdition) return;

    setUploading(true);
    try {
      const imageUrls: string[] = [];

      for (let i = 0; i < draftFiles.length; i++) {
        const base64 = draftPreviews[i];
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

      // Kirim ke API edisi images
      const res = await fetch(
        `/api/photoshoots/editions/${selectedEdition.id}/images`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrls }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setDraftFiles([]);
        setDraftPreviews([]);
        await fetchEditions();
        Swal.fire({
          icon: "success",
          title: "Foto Berhasil Diunggah!",
          text: `${imageUrls.length} foto berhasil diunggah ke edisi "${selectedEdition.name}"!`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal mengunggah foto.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal mengunggah foto ke server.",
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle Pilih File Pengganti untuk Foto Tertentu
  const handleSelectReplacement = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacementFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReplacementPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Simpan Penggantian Foto (PUT /api/photoshoots/images/[id])
  const handleSaveImageReplacement = async () => {
    if (!editingImageId || !replacementPreview) return;

    setUploading(true);
    try {
      let finalUrl = replacementPreview;
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: replacementPreview }),
        });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          if (url) finalUrl = url;
        }
      } catch {}

      const res = await fetch(`/api/photoshoots/images/${editingImageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: finalUrl }),
      });

      if (res.ok) {
        setEditingImageId(null);
        setReplacementFile(null);
        setReplacementPreview("");
        await fetchEditions();
        Swal.fire({
          icon: "success",
          title: "Foto Berhasil Diganti!",
          text: "Gambar photoshoot telah diperbarui.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const data = await res.json();
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal memperbarui foto.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Gagal memperbarui foto.",
      });
    } finally {
      setUploading(false);
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
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal menghapus foto.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Gagal menghapus foto.",
      });
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
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal menghapus edisi.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Gagal menghapus edisi.",
      });
    }
  };

  // Handle Hapus Semua Edisi Photoshoot
  const handleDeleteAllEditions = async () => {
    const result = await Swal.fire({
      title: "HAPUS SEMUA EDISI PHOTOSHOOT?",
      text: "PERINGATAN: Seluruh edisi dan foto photoshoot akan dihapus secara permanen dari sistem!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/photoshoots/editions", {
        method: "DELETE",
      });
      if (res.ok) {
        setEditions([]);
        setSelectedEditionId("");
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Semua edisi photoshoot telah dihapus.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const data = await res.json();
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal menghapus semua edisi.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Gagal menghapus semua edisi.",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-[#002D72]" />
            Kelola Photoshoot Model & Lookbook
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Pilih edisi melalui dropdown, pilih gambar ke daftar draft, dan
            tekan tombol <strong>Upload</strong> untuk memperbarui konten
            beranda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCreatingEdition(!isCreatingEdition)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#002D72] hover:bg-[#001D4A] text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            {isCreatingEdition ? "Batal" : "Buat Edisi Baru (misal Vol.3)"}
          </button>
          {editions.length > 0 && (
            <button
              onClick={handleDeleteAllEditions}
              className="px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Trash2 size={16} /> HAPUS SEMUA EDISI
            </button>
          )}
        </div>
      </div>

      {/* Form Buat Edisi Baru */}
      {isCreatingEdition && (
        <form
          onSubmit={handleCreateEdition}
          className="bg-blue-50/70 border border-blue-200 p-5 rounded-xl space-y-4 animate-scale-in"
        >
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
              className="px-5 py-2.5 bg-[#002D72] text-white text-xs font-bold rounded-lg hover:bg-[#001D4A] transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Simpan Edisi
            </button>
          </div>
        </form>
      )}

      {/* Konten Edisi */}
      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-500 animate-pulse">
          Memuat data edisi photoshoot...
        </div>
      ) : editions.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
          <h3 className="text-sm font-bold text-amber-900">
            Belum Ada Edisi Photoshoot
          </h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            Silakan klik tombol <strong>"Buat Edisi Baru"</strong> di atas untuk
            membuat edisi seperti <strong>Vol.1, Vol.2, atau Vol.3</strong>{" "}
            terlebih dahulu.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* BARIS DROPDOWN SELECT OPTION EDISI */}
          <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-xs font-black text-zinc-700 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5">
                <Layers size={16} className="text-[#002D72]" />
                Pilih Edisi Photoshoot:
              </label>

              {/* SELECT OPTION DROPDOWN */}
              <select
                value={selectedEditionId}
                onChange={(e) => {
                  setSelectedEditionId(e.target.value);
                  setPreviewIndex(0);
                  setDraftFiles([]);
                  setDraftPreviews([]);
                }}
                className="w-full sm:w-72 px-4 py-2.5 bg-white border border-zinc-300 rounded-lg text-sm font-bold text-zinc-800 shadow-xs focus:outline-none focus:border-[#002D72] cursor-pointer"
              >
                {editions.map((ed) => (
                  <option key={ed.id} value={ed.id}>
                    {ed.name} ({ed.photos.length}/10 Foto){" "}
                    {ed.isActive ? "★ [AKTIF BERANDA]" : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedEdition && (
              <div className="flex items-center gap-2">
                {/* Tombol Edit Nama Edisi */}
                <button
                  onClick={() => {
                    setEditingEditionId(selectedEdition.id);
                    setEditEditionName(selectedEdition.name);
                  }}
                  className="px-3 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit2 size={14} /> Edit Nama Edisi
                </button>

                {/* Tombol Set Active / Hapus */}
                {!selectedEdition.isActive && (
                  <button
                    onClick={() =>
                      handleSetActive(selectedEdition.id, selectedEdition.name)
                    }
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Aktifkan di Beranda
                  </button>
                )}
                <button
                  onClick={() =>
                    handleDeleteEdition(
                      selectedEdition.id,
                      selectedEdition.name,
                    )
                  }
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={14} /> Hapus Edisi
                </button>
              </div>
            )}
          </div>

          {/* Modal / Form Edit Nama Edisi Inline */}
          {editingEditionId && (
            <form
              onSubmit={handleUpdateEditionName}
              className="bg-zinc-100 border border-zinc-300 p-4 rounded-xl flex items-center gap-3 animate-scale-in"
            >
              <span className="text-xs font-bold text-zinc-700">
                Edit Nama Edisi:
              </span>
              <input
                type="text"
                value={editEditionName}
                onChange={(e) => setEditEditionName(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-zinc-300 rounded text-xs font-bold focus:outline-none focus:border-[#002D72]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#002D72] text-white text-xs font-bold rounded hover:bg-[#001D4A] transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <Save size={14} /> Simpan Nama
              </button>
              <button
                type="button"
                onClick={() => setEditingEditionId(null)}
                className="px-3 py-2 bg-zinc-200 text-zinc-700 text-xs font-bold rounded hover:bg-zinc-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </form>
          )}

          {/* Edisi Terpilih Dashboard Controls */}
          {selectedEdition && (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs space-y-6">
              {/* ALUR UPLOAD TERSTRUKTUR: PILIH BERKAS -> BARU TEKAN UPLOAD */}
              <div className="space-y-4 border-2 border-dashed border-zinc-300 hover:border-[#002D72] transition-colors p-6 rounded-xl text-center bg-zinc-50/50">
                <Upload className="w-8 h-8 text-[#002D72] mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-zinc-800 uppercase tracking-wide">
                    Input Photoshoot Edisi "{selectedEdition.name}"
                  </h3>
                  <p className="text-xs text-zinc-500 max-w-lg mx-auto">
                    1. Pilih beberapa gambar dari perangkat Anda • 2. Periksa
                    pratinjau draft • 3. Tekan tombol{" "}
                    <strong>Upload / Simpan Photoshoot</strong> di bawah.
                  </p>
                </div>

                {/* Input Pilihan Berkas */}
                <div className="flex justify-center pt-2">
                  <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm">
                    <Camera size={16} /> Pilih File Gambar
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading || photos.length >= 10}
                      onChange={handleSelectDraftFiles}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Pratinjau File Draft yang Belum Di-upload */}
                {draftPreviews.length > 0 && (
                  <div className="pt-4 border-t border-zinc-200 space-y-4 text-left animate-fade-in-up">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 uppercase">
                        Draft Siap Di-upload ({draftPreviews.length} foto
                        dipilih):
                      </span>
                      <button
                        onClick={() => {
                          setDraftFiles([]);
                          setDraftPreviews([]);
                        }}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Bersihkan Draft
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {draftPreviews.map((src, idx) => (
                        <div
                          key={idx}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-300 bg-zinc-100"
                        >
                          <img
                            src={src}
                            alt={`Draft ${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeDraftFile(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors cursor-pointer shadow"
                            title="Hapus dari draft"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* TOMBOL UPLOAD UTAMA (WAJIB DITEKAN ADMIN) */}
                    <div className="pt-2">
                      <button
                        onClick={handleExecuteBatchUpload}
                        disabled={uploading}
                        className="w-full py-3.5 bg-[#002D72] hover:bg-[#001D4A] text-white text-xs font-black uppercase tracking-widest rounded-lg transition-all hover:scale-[1.01] active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload size={16} />
                        {uploading
                          ? "Mengunggah Gambar ke Server..."
                          : `UPLOAD NOW (${draftPreviews.length} FOTO SLIDESHOW)`}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Edit / Replace Image Individual */}
              {editingImageId && (
                <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl space-y-4 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-[#002D72] uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={16} /> Ganti Foto Ini
                    </h4>
                    <button
                      onClick={() => {
                        setEditingImageId(null);
                        setReplacementPreview("");
                      }}
                      className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {replacementPreview ? (
                      <img
                        src={replacementPreview}
                        alt="Replacement Preview"
                        className="w-24 h-24 object-cover rounded-lg border border-zinc-300"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-zinc-200 rounded-lg flex items-center justify-center text-zinc-400 text-xs font-bold">
                        Pilih Foto
                      </div>
                    )}

                    <div className="space-y-2 flex-1">
                      <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-zinc-300 rounded text-xs font-bold text-zinc-800 hover:bg-zinc-50 cursor-pointer transition-colors">
                        Pilih Foto Pengganti Baru
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSelectReplacement}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-zinc-500">
                        Pilih berkas baru lalu tekan tombol Simpan Perubahan di
                        bawah.
                      </p>
                    </div>

                    <button
                      onClick={handleSaveImageReplacement}
                      disabled={!replacementPreview || uploading}
                      className="px-4 py-2.5 bg-[#002D72] text-white text-xs font-bold rounded-lg hover:bg-[#001D4A] disabled:opacity-50 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {uploading ? "Menyimpan..." : "Simpan Perubahan Foto"}
                    </button>
                  </div>
                </div>
              )}

              {/* Live Slideshow Preview Edisi (Rotasi 1 Detik, Ukuran Asli) */}
              {photos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                    <h3 className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center gap-2">
                      <Camera size={14} className="text-[#002D72]" /> Live
                      Preview Slideshow Beranda (1 Detik • Ukuran Asli)
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-zinc-500">
                        {previewIndex + 1} / {photos.length}
                      </span>
                      <button
                        onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
                        className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded transition-colors cursor-pointer"
                      >
                        {isPreviewPlaying ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative w-full h-[360px] sm:h-[450px] bg-zinc-950 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                    <img
                      src={photos[previewIndex]?.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover opacity-25 blur-xl pointer-events-none"
                    />
                    <img
                      src={photos[previewIndex]?.imageUrl}
                      alt="Preview"
                      className="relative z-10 max-h-full max-w-full object-contain mx-auto transition-all duration-300"
                    />
                    <div className="absolute bottom-3 left-4 z-20 bg-black/70 backdrop-blur-md px-3 py-1 rounded text-white text-[11px] font-bold">
                      {selectedEdition.name} • SLIDE {previewIndex + 1} /{" "}
                      {photos.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Galeri Foto Terunggah (Dilengkapi Tombol Edit & Hapus) */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                  Daftar Foto Terunggah ({photos.length} / 10 Foto)
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

                        {/* Overlay Akses Tombol Edit (Ganti Foto) & Hapus */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingImageId(photo.id);
                              setReplacementPreview(photo.imageUrl);
                            }}
                            className="p-2.5 bg-white text-zinc-800 hover:bg-zinc-100 rounded-full transition-transform active:scale-95 shadow-lg cursor-pointer"
                            title="Ganti/Edit foto ini"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteImage(photo.id)}
                            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform active:scale-95 shadow-lg cursor-pointer"
                            title="Hapus foto ini"
                          >
                            <Trash2 size={14} />
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
