"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

/**
 * Halaman Manajemen Kategori (CRUD)
 * Path: /admin/categories
 */
export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      setError("Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const flashMessage = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(msg);
      setTimeout(() => setError(""), 3000);
    }
  };

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
        flashMessage("success", `Kategori "${data.name}" berhasil dibuat!`);
      } else {
        flashMessage("error", data.error || "Gagal membuat kategori.");
      }
    } catch (err) {
      flashMessage("error", "Koneksi gagal.");
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
        flashMessage("success", "Kategori berhasil diperbarui!");
      } else {
        flashMessage("error", data.error || "Gagal memperbarui kategori.");
      }
    } catch (err) {
      flashMessage("error", "Koneksi gagal.");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${name}"? Tindakan ini akan menghapus SEMUA produk yang berada di kategori ini secara permanen!`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });

      if (res.ok) {
        setCategories(categories.filter((c) => c.id !== id));
        flashMessage("success", `Kategori "${name}" telah dihapus.`);
      } else {
        const data = await res.json();
        flashMessage("error", data.error || "Gagal menghapus kategori.");
      }
    } catch (err) {
      flashMessage("error", "Koneksi gagal.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider uppercase">MANAGE CATEGORIES</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase">Pengelolaan kategori jenis produk katalog</p>
        </div>
      </div>

      {success && (
        <div className="rounded border border-green-500/20 bg-green-500/10 p-3 text-xs font-semibold text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 h-fit space-y-6">
          <div>
            <h3 className="text-xs font-black text-white tracking-wider uppercase">TAMBAH KATEGORI</h3>
            <p className="text-[10px] text-gray-500 uppercase mt-0.5">Buat klasifikasi produk baru</p>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Kategori</label>
              <input
                type="text"
                placeholder="Contoh: Jaket, Celana, Aksesoris"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black font-black text-xs py-3.5 px-4 rounded uppercase tracking-widest hover:bg-accent hover:text-black cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> TAMBAH KATEGORI
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-900">
            <h3 className="text-xs font-black text-white tracking-widest uppercase">DAFTAR KATEGORI</h3>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-gray-500 uppercase tracking-widest animate-pulse">
              Memuat Data Kategori...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-20 text-center text-xs text-gray-500 uppercase tracking-widest">
              Belum ada kategori terdaftar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-gray-500 font-black uppercase tracking-wider bg-zinc-900/10">
                    <th className="px-6 py-4">Nama Kategori</th>
                    <th className="px-6 py-4">Slug</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent w-full max-w-[200px]"
                            required
                          />
                        ) : (
                          <span className="font-bold text-white text-sm">{cat.name}</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-500 font-mono">
                        {cat.slug}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {editingId === cat.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateCategory(cat.id)}
                              className="p-1.5 rounded bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 cursor-pointer"
                              title="Simpan"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white cursor-pointer"
                              title="Batal"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEdit(cat)}
                              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-600 cursor-pointer transition-colors"
                              title="Edit Kategori"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
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
