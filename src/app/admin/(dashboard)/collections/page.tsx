"use client";

import { useState, useEffect } from "react";
import { Collection, Product } from "@/types";
import { Plus, Edit2, Trash2, X, Check, Bookmark, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";

/**
 * Halaman Admin: Manajemen Koleksi (CRUD Collection)
 * Path: /admin/collections
 *
 * Fitur:
 * - Menampilkan daftar koleksi dan jumlah produk terhubung.
 * - Form Tambah Koleksi baru (Nama & Deskripsi).
 * - Edit Koleksi secara inline.
 * - Hapus Koleksi dengan konfirmasi SweetAlert2 (produk tidak dihapus, hanya dilepas dari koleksi).
 */
export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // State Form Tambah
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form Edit Inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCol, resProd] = await Promise.all([
        fetch("/api/collections").catch(() => null),
        fetch("/api/products").catch(() => null),
      ]);

      if (resCol && resCol.ok) {
        const data = await resCol.json();
        if (Array.isArray(data)) setCollections(data);
      }
      if (resProd && resProd.ok) {
        const data = await resProd.json();
        if (Array.isArray(data)) setProducts(data);
      }
    } catch (err) {
      console.error("Gagal memuat data koleksi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hitung produk terikat per koleksi
  const getProductCount = (collectionId: string) => {
    if (!Array.isArray(products)) return 0;
    return products.filter((p) => p.collectionId === collectionId).length;
  };

  // Tambah Koleksi Baru
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        await fetchData();
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Koleksi baru berhasil ditambahkan.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: errorData.error || "Gagal menambahkan koleksi. Silakan pastikan Anda sudah login admin.",
          confirmButtonColor: "#002D72",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Terjadi kesalahan koneksi server.",
        confirmButtonColor: "#002D72",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Membuka Mode Edit Inline
  const startEdit = (col: Collection) => {
    setEditingId(col.id);
    setEditName(col.name);
    setEditDescription(col.description || "");
  };

  // Simpan Edit Inline
  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;

    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDescription }),
      });

      if (res.ok) {
        setEditingId(null);
        await fetchData();
        Swal.fire({
          icon: "success",
          title: "Diperbarui!",
          text: "Data koleksi berhasil diperbarui.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: errorData.error || "Gagal memperbarui koleksi.",
          confirmButtonColor: "#002D72",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Terjadi kesalahan server.",
        confirmButtonColor: "#002D72",
      });
    }
  };

  // Hapus Koleksi
  const handleDelete = async (id: string, colName: string) => {
    const result = await Swal.fire({
      title: "Hapus Koleksi?",
      text: `Koleksi "${colName}" akan dihapus. Produk terkait tidak akan dihapus, hanya dilepas dari koleksi ini.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#002D72",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#ffffff",
      color: "#18181b",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/collections/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchData();
        Swal.fire({
          icon: "success",
          title: "Dihapus!",
          text: `Koleksi "${colName}" berhasil dihapus.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: errorData.error || "Gagal menghapus koleksi.",
          confirmButtonColor: "#002D72",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Terjadi kesalahan server.",
        confirmButtonColor: "#002D72",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-black text-zinc-900 tracking-wider uppercase flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" /> Kelola Koleksi Eksklusif
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Tambah, edit, dan hapus koleksi produk (misal: Edisi Kolaborasi Croire, Summer 2026, dll)
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-primary transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Grid: Form Tambah & Tabel Koleksi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Tambah Koleksi */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 space-y-4 h-fit shadow-sm">
          <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-200 pb-3">
            <Plus className="h-4 w-4 text-primary" /> Tambah Koleksi Baru
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Nama Koleksi *</label>
              <input
                type="text"
                placeholder="Contoh: CORECULTURE x Croire"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Deskripsi (Opsional)</label>
              <textarea
                rows={3}
                placeholder="Deskripsi singkat mengenai edisi koleksi ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-primary-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Koleksi"}
            </button>
          </form>
        </div>

        {/* Tabel Daftar Koleksi */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">Daftar Koleksi</span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              {Array.isArray(collections) ? collections.length : 0} Koleksi
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-400">Memuat data koleksi...</div>
          ) : !Array.isArray(collections) || collections.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400 font-semibold italic">Belum ada koleksi yang ditambahkan.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-800">
                <thead className="bg-zinc-100/70 border-b border-zinc-200 text-[10px] uppercase tracking-wider font-bold text-zinc-500">
                  <tr>
                    <th className="px-6 py-3">Nama & Slug</th>
                    <th className="px-6 py-3">Deskripsi</th>
                    <th className="px-6 py-3 text-center">Jumlah Produk</th>
                    <th className="px-6 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {collections.map((col) => {
                    const isEditing = editingId === col.id;
                    const count = getProductCount(col.id);

                    return (
                      <tr key={col.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-white border border-zinc-300 rounded px-2 py-1 text-xs text-zinc-900 focus:outline-none focus:border-primary"
                            />
                          ) : (
                            <div>
                              <div className="font-bold text-zinc-900">{col.name}</div>
                              <div className="text-[10px] text-zinc-400 font-mono">/collection/{col.slug}</div>
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {isEditing ? (
                            <textarea
                              rows={2}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full bg-white border border-zinc-300 rounded px-2 py-1 text-xs text-zinc-900 focus:outline-none focus:border-primary"
                            />
                          ) : (
                            <span className="text-zinc-500 text-xs line-clamp-2">
                              {col.description || "-"}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                            {count} Produk
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleUpdate(col.id)}
                                className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer"
                                title="Simpan"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 bg-zinc-200 text-zinc-700 rounded hover:bg-zinc-300 transition-colors cursor-pointer"
                                title="Batal"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(col)}
                                className="p-1.5 text-zinc-500 hover:text-primary hover:bg-zinc-100 rounded transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(col.id, col.name)}
                                className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Hapus"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
