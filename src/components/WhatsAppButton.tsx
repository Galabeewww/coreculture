"use client";

import { usePathname } from "next/navigation";

/**
 * Komponen: Tombol WhatsApp Floating
 *
 * Bulat, warna hijau WhatsApp, fixed di kanan bawah.
 * Klik untuk langsung menghubungi perusahaan via WhatsApp.
 * Otomatis tersembunyi di seluruh Admin Panel (/admin).
 */
export default function WhatsAppButton() {
  const pathname = usePathname();

  // Sembunyikan di seluruh bagian Admin Panel (/admin)
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp perusahaan
  const message = encodeURIComponent(
    "Halo CORECULTURE! Saya tertarik dengan produk streetwear kalian. Boleh info lebih lanjut?"
  );
  const waUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hubungi kami via WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
    >
      <div className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer">
        {/* Pulse Ring Animation */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
        {/* WhatsApp Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          fill="white"
          className="w-7 h-7 relative z-10"
        >
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.052 9.376L1.056 31.2l6.012-1.964A15.88 15.88 0 0 0 16.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.334 22.608c-.394 1.112-1.944 2.034-3.192 2.304-.852.182-1.964.326-5.712-1.228-4.802-1.988-7.892-6.858-8.13-7.176-.23-.318-1.884-2.51-1.884-4.788s1.184-3.396 1.612-3.862c.394-.428 1.04-.64 1.66-.64.196 0 .376.01.536.018.428.018.644.044.928.718.354.842 1.216 2.966 1.322 3.18.108.218.218.508.068.788-.14.288-.266.414-.484.666-.218.252-.426.444-.644.716-.196.236-.416.49-.174.928.244.432 1.082 1.784 2.324 2.892 1.596 1.422 2.9 1.876 3.372 2.072.354.148.778.112 1.03-.15.322-.338.718-.898 1.12-1.45.286-.394.646-.444 1.032-.288.392.148 2.462 1.162 2.884 1.374.422.212.702.318.806.498.104.18.104 1.03-.29 2.142z" />
        </svg>
      </div>

      {/* Tooltip */}
      <span className="absolute right-16 bottom-3 bg-zinc-900 text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg">
        Hubungi via WhatsApp
      </span>
    </a>
  );
}
