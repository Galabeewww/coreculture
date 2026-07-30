"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Download,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import AdminPagination from "@/components/AdminPagination";

/**
 * Halaman Manajemen Kategori (CRUD)
 * Path: /admin/categories
 */
export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state (7 item per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  const handleDeleteAllCategories = async () => {
    const result = await Swal.fire({
      title: "HAPUS SEMUA KATEGORI?",
      text: "PERINGATAN: Seluruh kategori dan produk di dalamnya akan dihapus secara permanen dari database!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Semua!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/categories", { method: "DELETE" });
      if (res.ok) {
        setCategories([]);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Semua kategori telah dihapus.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const data = await res.json();
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: data.error || "Gagal menghapus semua kategori.",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Kesalahan!",
        text: "Gagal menghapus semua kategori.",
      });
    }
  };

  const handleExportExcel = () => {
    exportToExcel(
      "laporan_kategori_coreculture",
      [
        { key: "name", label: "Nama Kategori" },
        { key: "slug", label: "Slug" },
        { key: "createdAt", label: "Tanggal Dibuat" },
      ],
      categories,
    );
  };

  const handleExportPDF = () => {
    exportToPDF(
      "Laporan Data Kategori Katalog",
      "CORECULTURE Fashion Category Management",
      [
        { key: "name", label: "Nama Kategori" },
        { key: "slug", label: "Slug URL" },
        { key: "createdAt", label: "Tanggal Dibuat" },
      ],
      categories,
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-wider uppercase">
            MANAGE CATEGORIES
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase">
            Pengelolaan kategori jenis produk katalog
          </p>
        </div>

        {/* Action Buttons: Export & Delete All */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download size={14} /> Excel (.csv)
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-[#c90000] hover:bg-[#a10202] text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileText size={14} /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Add */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 h-fit space-y-6 shadow-xs">
          <div>
            <h3 className="text-xs font-black text-zinc-800 tracking-wider uppercase">
              TAMBAH KATEGORI
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
              Buat klasifikasi produk baru
            </p>
          </div>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase">
                Nama Kategori
              </label>
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

        {/* Tabel List */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs">
          <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
            <h3 className="text-xs font-black text-zinc-800 tracking-widest uppercase">
              DAFTAR KATEGORI ({categories.length})
            </h3>
            {categories.length > 0 && (
              <button
                onClick={handleDeleteAllCategories}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Trash2 size={14} /> HAPUS SEMUA KATEGORI
              </button>
            )}
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
                  {paginatedCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-zinc-50 transition-colors"
                    >
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
                          <span className="font-bold text-zinc-800 text-sm">
                            {cat.name}
                          </span>
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
                              onClick={() =>
                                handleDeleteCategory(cat.id, cat.name)
                              }
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

              <AdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={categories.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
