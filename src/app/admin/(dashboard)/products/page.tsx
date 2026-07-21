"use client";

import { useEffect, useState } from "react";
import { Product, Category } from "@/types";
import { Plus, Edit2, Trash2, X, ImageIcon } from "lucide-react";
import { formatIDR } from "@/components/ProductCard";

/**
 * Halaman CRUD Produk Admin
 * Path: /admin/products
 */
export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const SIZE_OPTIONS = ["S", "M", "L", "XL", "28", "30", "32", "34", "All Size"];

  const PRESET_IMAGES = [
    { label: "Black Street Tee", url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600" },
    { label: "White Classic Tee", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600" },
    { label: "Techwear Cargo", url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600" },
    { label: "Baggy Jeans", url: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600" },
    { label: "Varsity Jacket", url: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=600" },
    { label: "Cotton Hoodie", url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600" },
    { label: "Leather Bag", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600" },
    { label: "Snapback Cap", url: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=600" },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProd, resCat] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories")
      ]);
      if (resProd.ok && resCat.ok) {
        setProducts(await resProd.json());
        const catData = await resCat.json();
        setCategories(catData);
        if (catData.length > 0) setCategoryId(catData[0].id);
      }
    } catch (err) {
      setError("Gagal mengambil data produk/kategori.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const openAddForm = () => {
    setEditingProduct(null);
    setName("");
    setPrice(199000);
    setStock(20);
    setDescription("");
    setImage(PRESET_IMAGES[0].url);
    if (categories.length > 0) setCategoryId(categories[0].id);
    setSelectedSizes(["M", "L", "XL"]);
    setIsFormOpen(true);
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price);
    setStock(prod.stock);
    setDescription(prod.description);
    setImage(prod.image);
    setCategoryId(prod.categoryId);
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

    if (!name.trim() || !image.trim() || !categoryId) {
      alert("Silakan lengkapi formulir produk wajib!");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      image: image.trim(),
      sizes: selectedSizes.length > 0 ? selectedSizes : ["All Size"],
      categoryId
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
          flashMessage("success", "Produk berhasil diperbarui!");
          setIsFormOpen(false);
        } else {
          flashMessage("error", data.error || "Gagal memperbarui produk.");
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
          flashMessage("success", `Produk "${data.name}" berhasil ditambahkan!`);
          setIsFormOpen(false);
        } else {
          flashMessage("error", data.error || "Gagal menambahkan produk.");
        }
      }
    } catch (err) {
      flashMessage("error", "Koneksi ke API gagal.");
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    const confirmDelete = window.confirm(`Apakah Anda yakin ingin menghapus produk "${prodName}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
        flashMessage("success", `Produk "${prodName}" telah dihapus.`);
      } else {
        const data = await res.json();
        flashMessage("error", data.error || "Gagal menghapus produk.");
      }
    } catch (err) {
      flashMessage("error", "Koneksi gagal.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider uppercase">MANAGE PRODUCTS</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase">Pengelolaan katalog pakaian dan aksesoris</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-accent text-black font-black text-xs px-4 py-3 rounded cursor-pointer glow-accent hover:scale-[1.02] transition-transform uppercase"
        >
          <Plus className="h-4 w-4" /> TAMBAH PRODUK BARU
        </button>
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

      <div className="bg-zinc-950 border border-zinc-900 rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-zinc-900">
          <h3 className="text-xs font-black text-white tracking-widest uppercase">DAFTAR KATALOG</h3>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-gray-500 uppercase tracking-widest animate-pulse">
            Memuat Data Katalog...
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-500 uppercase tracking-widest">
            Belum ada produk terdaftar. Klik "+ Tambah Produk Baru" untuk memulai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-gray-500 font-black uppercase tracking-wider bg-zinc-900/10">
                  <th className="px-6 py-4">Gambar & Nama</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Varian Ukuran</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {products.map((prod) => {
                  const catName = categories.find((c) => c.id === prod.categoryId)?.name || "Lainnya";
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-900/20 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="h-12 w-9 rounded overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                          <img src={prod.image} alt={prod.name} className="h-full w-full object-cover" />
                        </div>
                        <span className="font-bold text-white text-sm">{prod.name}</span>
                      </td>

                      <td className="px-6 py-4 text-gray-400 font-semibold uppercase text-[10px] tracking-wide">
                        {catName}
                      </td>

                      <td className="px-6 py-4 text-gray-400 font-bold">
                        {formatIDR(prod.price)}
                      </td>

                      <td className="px-6 py-4">
                        {prod.stock === 0 ? (
                          <span className="text-red-500 font-black uppercase tracking-wider text-[10px]">SOLD OUT</span>
                        ) : (
                          <span className="text-gray-300 font-bold">{prod.stock} Pcs</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {prod.sizes.map((s) => (
                            <span key={s} className="bg-zinc-900 border border-zinc-800 text-[9px] px-1.5 py-0.5 rounded text-gray-400 font-black">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(prod)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white hover:border-zinc-600 cursor-pointer transition-colors"
                            title="Edit Produk"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
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
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
              <h3 className="text-xs font-black text-white tracking-widest uppercase">
                {editingProduct ? "EDIT PRODUK KATALOG" : "TAMBAH PRODUK BARU"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-900 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Graphic Tees V2"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Kategori *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                    required
                  >
                    {categories.length === 0 ? (
                      <option disabled>Silakan buat kategori dahulu</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Harga Produk (Rupiah) *</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Jumlah Stok *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Deskripsi Produk</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail bahan, kelebihan produk, fitting size..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-zinc-500" />
                  <label className="text-[10px] font-bold text-gray-500 uppercase">URL Gambar Produk *</label>
                </div>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="Ketikkan URL gambar disini..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-accent"
                />
                
                <div className="space-y-1.5 pt-1">
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">REKOMENDASI GAMBAR STREETWEAR (KLIK UNTUK MEMILIH):</span>
                  <div className="flex flex-wrap gap-1">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.label}
                        type="button"
                        onClick={() => setImage(img.url)}
                        className={`text-[9px] px-2 py-1 rounded border font-semibold transition-all cursor-pointer ${
                          image === img.url
                            ? "bg-accent border-accent text-black"
                            : "bg-zinc-900 border-zinc-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Pilih Varian Ukuran (Pilih Minimal Satu) *</label>
                <div className="flex flex-wrap gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded">
                  {SIZE_OPTIONS.map((size) => (
                    <label key={size} className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => handleSizeChange(size)}
                        className="rounded accent-accent border-zinc-800 bg-zinc-900 h-4 w-4 cursor-pointer"
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded px-4 py-2.5 text-xs text-gray-400 hover:text-white font-bold cursor-pointer transition-colors uppercase"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-accent hover:text-black font-black text-xs px-5 py-2.5 rounded cursor-pointer transition-colors uppercase"
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
