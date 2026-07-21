/**
 * Komponen: Footer Publik
 * 
 * Fitur:
 * - Desain premium minimalis berwarna gelap.
 * - Informasi brand, link navigasi cepat, newsletter pendaftaran mock, dan hak cipta.
 */
export default function Footer() {
  return (
    <footer className="bg-black border-t border-zinc-900 mt-auto text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Tentang Brand */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-black tracking-widest uppercase">CORECULTURE</h3>
            <p className="text-sm max-w-sm text-gray-500">
              Mendefinisikan ulang kultur streetwear modern dengan rilisan eksklusif dan kualitas tanpa kompromi. Dibuat untuk mereka yang membentuk budaya masa kini.
            </p>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Dukungan</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Hubungi Kami</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Cara Pembayaran</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Panduan Ukuran</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Pengembalian & Penukaran</a></li>
            </ul>
          </div>

          {/* Newsletter / Socials Mock */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Ikuti Kami</h4>
            <p className="text-xs text-gray-500">Dapatkan akses awal ke drop koleksi terbaru dan diskon eksklusif.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email Anda"
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
              />
              <button className="bg-white text-black font-semibold text-xs px-4 py-2 rounded hover:bg-accent hover:text-black cursor-pointer transition-colors duration-200">
                JOIN
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
          <div>
            &copy; {new Date().getFullYear()} CORECULTURE Studio. Hak Cipta Dilindungi.
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <span>Indonesia (IDR 🇮🇩)</span>
            <a href="#" className="hover:text-white transition-colors duration-200">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
