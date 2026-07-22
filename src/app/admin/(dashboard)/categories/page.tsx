"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import Swal from "sweetalert2";

/**
 * Halaman Manajemen Kategori (CRUD)
 * Path: /admin/categories
 * 
 * Diperbarui dengan SweetAlert2 untuk konfirmasi hapus dan notifikasi pop-up.
 */
export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat!",
        text: "Terjadi kesalahan saat mengambil data kategori.",
        confirmButtonColor: "#002D72",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setCategories([...categories, data]);
        setNewCatName("");
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Kategori "${data.name}" berhasil dibuat.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal membuat kategori.",
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
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setCategories(categories.map((c) => (c.id === id ? data : c)));
        setEditingId(null);
        Swal.fire({
          icon: "success",
          title: "Diperbarui!",
          text: "Kategori berhasil diperbarui.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal memperbarui kategori.",
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

  const handleDeleteCategory = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: "Hapus Kategori?",
      text: `Apakah Anda yakin ingin menghapus kategori "${name}"? Tindakan ini akan menghapus SEMUA produk di dalamnya secara permanen!`,
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
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });

      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        Swal.fire({
          icon: "success",
          title: "Dihapus!",
          text: `Kategori "${name}" telah dihapus.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const data = await res.json();
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal menghapus kategori.",
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
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div>
        <h2 className="text-2xl font-black text-zinc-900 tracking-wider uppercase">MANAGE CATEGORIES</h2>
        <p className="text-xs text-zinc-500 mt-1 uppercase">Pengelolaan kategori jenis produk katalog</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Add */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 h-fit space-y-6 shadow-sm">
          <div>
            <h3 className="text-xs font-black text-zinc-800 tracking-wider uppercase">TAMBAH KATEGORI</h3>
            <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Buat klasifikasi produk baru</p>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Jaket, Celana, Aksesoris"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded px-3 py-3 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white font-black text-xs py-3.5 px-4 rounded uppercase tracking-widest hover:bg-primary-hover cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> TAMBAH KATEGORI
            </button>
          </form>
        </div>

        {/* Kolom Kanan: Tabel List */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50">
            <h3 className="text-xs font-black text-zinc-800 tracking-widest uppercase">DAFTAR KATEGORI</h3>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
              Memuat Data Kategori...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center text-xs text-zinc-500 uppercase tracking-widest">
              Belum ada kategori terdaftar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-black uppercase tracking-wider bg-zinc-50">
                    <th className="px-6 py-4">Nama Kategori</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-white border border-zinc-200 rounded px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-primary w-full max-w-[200px]"
                            required
                          />
                        ) : (
                          <span className="font-bold text-zinc-800 text-sm">{cat.name}</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-zinc-400 font-mono">
                        {cat.slug}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {editingId === cat.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateCategory(cat.id)}
                              className="p-1.5 rounded bg-green-500/10 border border-green-500/20 text-green-600 hover:bg-green-500/20 cursor-pointer"
                              title="Simpan"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-800 cursor-pointer"
                              title="Batal"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(cat)}
                              className="p-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-primary hover:border-primary cursor-pointer transition-colors"
                              title="Edit Kategori"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20 cursor-pointer transition-colors"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
