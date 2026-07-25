"use client";

import { useEffect, useState } from "react";
import { Product, Category, Collection } from "@/types";
import { Plus, Edit2, Trash2, X, Upload, Bookmark, Download, FileText } from "lucide-react";
import { formatIDR } from "@/components/ProductCard";
import Swal from "sweetalert2";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import AdminPagination from "@/components/AdminPagination";

/**
 * Halaman CRUD Produk Admin
 * Path: /admin/products
 * 
 * Diperbarui:
 * - Penanganan independen fetch data API (kategori, koleksi, produk).
 * - Dukungan relasi Koleksi (Collection ID).
 * - SweetAlert2 untuk notifikasi & dialog konfirmasi hapus.
 * - Unggah foto langsung (Base64) bagian depan & belakang.
 */
export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state (7 item per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // State untuk form overlay modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [imageFront, setImageFront] = useState("");
  const [imageBack, setImageBack] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // State loading saat proses encode file
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);

  const SIZE_OPTIONS = ["S", "M", "L", "XL", "28", "30", "32", "34", "All Size"];



  // Konversi berkas unggahan ke Base64
  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFront(true);
    try {
      const { compressImageFile } = await import("@/lib/imageCompressor");
      const base64 = await compressImageFile(file, 1600, 0.85);
      setImageFront(base64);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Gagal!", text: "Gagal memproses berkas gambar depan." });
    } finally {
      setUploadingFront(false);
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBack(true);
    try {
      const { compressImageFile } = await import("@/lib/imageCompressor");
      const base64 = await compressImageFile(file, 1600, 0.85);
      setImageBack(base64);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Gagal!", text: "Gagal memproses berkas gambar belakang." });
    } finally {
      setUploadingBack(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat, resCol] = await Promise.all([
        fetch("/api/products").catch(() => null),
        fetch("/api/categories").catch(() => null),
        fetch("/api/collections").catch(() => null)
      ]);

      if (resProd && resProd.ok) {
        const prodData = await resProd.json();
        if (Array.isArray(prodData)) setProducts(prodData);
      }
      if (resCat && resCat.ok) {
        const catData = await resCat.json();
        if (Array.isArray(catData)) {
          setCategories(catData);
          if (catData.length > 0) setCategoryId((prev) => prev || catData[0].id);
        }
      }
      if (resCol && resCol.ok) {
        const colData = await resCol.json();
        if (Array.isArray(colData)) setCollections(colData);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingProduct(null);
    setName("");
    setPrice(199000);
    setStock(20);
    setDescription("");
    setImageFront("");
    setImageBack("");
    setCategoryId(categories.length > 0 ? categories[0].id : "");
    setCollectionId("");
    setSelectedSizes(["M", "L", "XL"]);
    setIsFormOpen(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price);
    setStock(prod.stock);
    setDescription(prod.description);
    setImageFront(prod.imageFront);
    setImageBack(prod.imageBack || prod.imageFront);
    setCategoryId(prod.categoryId);
    setCollectionId(prod.collectionId || "");
    setSelectedSizes(prod.sizes);
    setIsFormOpen(true);
  };

  const handleSizeChange = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !imageFront.trim() || !categoryId) {
      Swal.fire({
        icon: "warning",
        title: "Form Belum Lengkap",
        text: "Silakan lengkapi nama produk, kategori, dan gambar depan wajib!",
        confirmButtonColor: "#002D72"
      });
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      imageFront: imageFront.trim(),
      imageBack: imageBack.trim(),
      sizes: selectedSizes.length > 0 ? selectedSizes : ["All Size"],
      categoryId,
      collectionId: collectionId || null
    };

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          setProducts(products.map((p) => (p.id === editingProduct.id ? data : p)));
          setIsFormOpen(false);
          Swal.fire({
            icon: "success",
            title: "Diperbarui!",
            text: "Produk berhasil diperbarui.",
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal memperbarui produk." });
        }
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (res.ok) {
          setProducts([data, ...products]);
          setIsFormOpen(false);
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: `Produk "${data.name}" berhasil ditambahkan!`,
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal menambahkan produk." });
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Kesalahan!", text: "Koneksi ke API gagal." });
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    const result = await Swal.fire({
      title: "Hapus Produk?",
      text: `Apakah Anda yakin ingin menghapus produk "${prodName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#002D72",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      background: "#ffffff",
      color: "#18181b"
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        Swal.fire({
          icon: "success",
          title: "Dihapus!",
          text: `Produk "${prodName}" telah dihapus.`,
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal menghapus produk." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Kesalahan!", text: "Koneksi ke server gagal." });
    }
  };

  const handleDeleteAllProducts = async () => {
    const result = await Swal.fire({
      title: "HAPUS SEMUA PRODUK?",
      text: "PERINGATAN SANGAT PENTING: Seluruh katalog produk akan dihapus secara permanen dari sistem!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, Hapus Semua Produk!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/products", { method: "DELETE" });
      if (res.ok) {
        setProducts([]);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Semua produk berhasil dihapus.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const data = await res.json();
        Swal.fire({ icon: "error", title: "Gagal!", text: data.error || "Gagal menghapus semua produk." });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Kesalahan!", text: "Koneksi server gagal." });
    }
  };

  const handleExportExcel = () => {
    const formattedData = products.map((p) => ({
      name: p.name,
      category: categories.find((c) => c.id === p.categoryId)?.name || p.categoryId,
      collection: collections.find((c) => c.id === p.collectionId)?.name || "-",
      price: formatIDR(p.price),
      stock: p.stock,
      sizes: p.sizes.join(", "),
    }));

    exportToExcel(
      "laporan_katalog_produk_coreculture",
      [
        { key: "name", label: "Nama Produk" },
        { key: "category", label: "Kategori" },
        { key: "collection", label: "Koleksi" },
        { key: "price", label: "Harga (IDR)" },
        { key: "stock", label: "Stok Usaha" },
        { key: "sizes", label: "Varian Ukuran" },
      ],
      formattedData
    );
  };

  const handleExportPDF = () => {
    const formattedData = products.map((p) => ({
      name: p.name,
      category: categories.find((c) => c.id === p.categoryId)?.name || p.categoryId,
      collection: collections.find((c) => c.id === p.collectionId)?.name || "-",
      price: formatIDR(p.price),
      stock: p.stock,
      sizes: p.sizes.join(", "),
    }));

    exportToPDF(
      "Laporan Master Katalog Produk",
      "CORECULTURE Product Inventory & Catalog Report",
      [
        { key: "name", label: "Nama Produk" },
        { key: "category", label: "Kategori" },
        { key: "collection", label: "Koleksi" },
        { key: "price", label: "Harga" },
        { key: "stock", label: "Stok" },
        { key: "sizes", label: "Ukuran" },
      ],
      formattedData
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-wider uppercase">MANAGE PRODUCTS</h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase">Pengelolaan katalog pakaian, aksesoris, dan koleksi</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download size={14} /> Export Excel (.csv)
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-[#002D72] hover:bg-[#001D4A] text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileText size={14} /> Export PDF Report
          </button>
          {products.length > 0 && (
            <button
              onClick={handleDeleteAllProducts}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Trash2 size={14} /> HAPUS SEMUA PRODUK
            </button>
          )}
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-primary text-white font-black text-xs px-4 py-2.5 rounded-lg cursor-pointer shadow-md hover:bg-primary-hover transition-colors uppercase"
          >
            <Plus className="h-4 w-4" /> TAMBAH PRODUK BARU
          </button>
        </div>
      </div>

      {/* Tabel Produk */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50">
          <h3 className="text-xs font-black text-zinc-800 tracking-widest uppercase">DAFTAR KATALOG</h3>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-zinc-500 uppercase tracking-widest animate-pulse">
            Memuat Data Katalog...
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-500 uppercase tracking-widest">
            Belum ada produk terdaftar. Klik "+ Tambah Produk Baru" untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500 font-black uppercase tracking-wider bg-zinc-50">
                  <th className="px-6 py-4">Gambar & Nama</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Koleksi</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Varian Ukuran</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {paginatedProducts.map((prod) => {
                  const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Lainnya";
                  const colName = collections.find((col) => col.id === prod.collectionId)?.name;

                  return (
                    <tr key={prod.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-12 w-9 rounded overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                          <img src={prod.imageFront} alt={prod.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-bold text-zinc-900 text-sm">{prod.name}</span>
                      </td>

                      <td className="px-6 py-4 text-zinc-500 font-bold uppercase text-[10px] tracking-wide">
                        {catName}
                      </td>

                      <td className="px-6 py-4">
                        {colName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary uppercase">
                            <Bookmark className="h-3 w-3" /> {colName}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[10px] font-mono">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-zinc-700 font-bold">
                        {formatIDR(prod.price)}
                      </td>

                      <td className="px-6 py-4">
                        {prod.stock === 0 ? (
                          <span className="text-red-500 font-black uppercase tracking-wider text-[10px]">SOLD OUT</span>
                        ) : (
                          <span className="text-zinc-700 font-bold">{prod.stock} Pcs</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {prod.sizes.map((s) => (
                            <span key={s} className="bg-zinc-100 border border-zinc-200 text-[9px] px-1.5 py-0.5 rounded text-zinc-500 font-black">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(prod)}
                            className="p-1.5 rounded bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-primary hover:border-primary cursor-pointer transition-colors"
                            title="Edit Produk"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-600 hover:bg-red-500/20 cursor-pointer transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={products.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* ==============================================
          MODAL OVERLAY: FORM TAMBAH / EDIT PRODUK
          ============================================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col text-zinc-800">
            
            <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
              <h3 className="text-xs font-black text-zinc-800 tracking-widest uppercase">
                {editingProduct ? "EDIT PRODUK KATALOG" : "TAMBAH PRODUK BARU"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Varsity Jacket Legacy"
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Kategori Produk *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-primary"
                    required
                  >
                    {categories.length === 0 ? (
                      <option disabled value="">Buat kategori terlebih dahulu</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Koleksi (Opsional)</label>
                  <select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-primary"
                  >
                    <option value="">Tanpa Koleksi</option>
                    {collections.map((col) => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Harga Produk (Rupiah) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Jumlah Stok *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail bahan, kelebihan produk, fitting size..."
                  className="w-full bg-white border border-zinc-200 rounded px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* SECTION: INPUT GAMBAR DENGAN UPLOAD FILE */}
              <div className="space-y-4 border-t border-zinc-100 pt-4">
                <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider">GAMBAR PRODUK (UNGGAH FOTO)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Unggah Gambar Depan */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">1. Foto Bagian Depan *</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg p-4 bg-zinc-50 relative aspect-[4/5] overflow-hidden group">
                      {imageFront ? (
                        <>
                          <img src={imageFront} alt="Preview Depan" className="w-full h-full object-cover absolute inset-0 z-0" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImageFront(""); }}
                              className="text-white text-[10px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded cursor-pointer flex items-center gap-1.5 shadow-md transition-colors z-30"
                              title="Hapus Gambar Depan"
                            >
                              <Trash2 className="h-4 w-4" /> HAPUS
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center space-y-2 z-10">
                          <Upload className="h-6 w-6 text-zinc-400 mx-auto" />
                          <span className="text-[10px] text-zinc-500 font-medium block">Pilih berkas foto depan</span>
                          <span className="text-[9px] text-zinc-400 block">(Max 5MB, format JPG/PNG)</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFrontUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        title="Unggah Foto Depan"
                      />
                    </div>
                    {uploadingFront && <p className="text-[10px] text-primary font-bold animate-pulse text-center">Memproses file...</p>}
                  </div>

                  {/* Unggah Gambar Belakang */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">2. Foto Bagian Belakang (Opsional)</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg p-4 bg-zinc-50 relative aspect-[4/5] overflow-hidden group">
                      {imageBack ? (
                        <>
                          <img src={imageBack} alt="Preview Belakang" className="w-full h-full object-cover absolute inset-0 z-0" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImageBack(""); }}
                              className="text-white text-[10px] font-bold uppercase tracking-wider bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded cursor-pointer flex items-center gap-1.5 shadow-md transition-colors z-30"
                              title="Hapus Gambar Belakang"
                            >
                              <Trash2 className="h-4 w-4" /> HAPUS
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="text-center space-y-2 z-10">
                          <Upload className="h-6 w-6 text-zinc-400 mx-auto" />
                          <span className="text-[10px] text-zinc-500 font-medium block">Pilih berkas foto belakang</span>
                          <span className="text-[9px] text-zinc-400 block">(Max 5MB, format JPG/PNG)</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        title="Unggah Foto Belakang"
                      />
                    </div>
                    {uploadingBack && <p className="text-[10px] text-primary font-bold animate-pulse text-center">Memproses file...</p>}
                  </div>
                </div>


              </div>

              {/* Varian Ukuran */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Varian Ukuran *</label>
                <div className="flex flex-wrap gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded">
                  {SIZE_OPTIONS.map((size) => (
                    <label key={size} className="flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => handleSizeChange(size)}
                        className="rounded accent-primary border-zinc-200 bg-white h-4 w-4 cursor-pointer"
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer Modal Action */}
              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded px-4 py-2.5 text-xs text-zinc-600 font-bold cursor-pointer transition-colors uppercase"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white hover:bg-primary-hover font-black text-xs px-5 py-2.5 rounded cursor-pointer transition-colors uppercase"
                >
                  SIMPAN
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
