"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage?: number;
}

/**
 * Komponen Pagination Admin
 * Menampilkan kontrol navigasi halaman jika jumlah data > itemsPerPage (default 7).
 */
export default function AdminPagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 7,
}: AdminPaginationProps) {
  if (totalItems <= itemsPerPage || totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Buat array nomor halaman
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
      <div className="text-zinc-500 font-medium">
        Menampilkan <span className="font-bold text-zinc-900">{startItem}</span> -{" "}
        <span className="font-bold text-zinc-900">{endItem}</span> dari{" "}
        <span className="font-bold text-zinc-900">{totalItems}</span> data
      </div>

      <div className="flex items-center gap-1.5">
        {/* Tombol Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Nomor Halaman */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              currentPage === page
                ? "bg-[#002D72] text-white"
                : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Tombol Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
