/**
 * Komponen: Footer Publik
 * 
 * Fitur:
 * - Desain premium berlatar belakang warna primer #002D72 (Deep Blue).
 * - Informasi lengkap brand, pendaftaran email, dan hak cipta.
 */
export default function Footer() {
  return (
    <footer className="bg-primary border-t border-primary-hover mt-auto text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Tentang Brand */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-black tracking-widest uppercase">CORECULTURE</h3>
            <p className="text-sm max-w-sm text-white/70">
              Mendefinisikan ulang kultur streetwear modern dengan rilisan eksklusif dan kualitas tanpa kompromi. Dibuat untuk mereka yang membentuk budaya masa kini.
            </p>
          </div>

          {/* Tautan Cepat */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Dukungan</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Hubungi Kami</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Cara Pembayaran</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Panduan Ukuran</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Pengembalian & Penukaran</a></li>
            </ul>
          </div>

          {/* Newsletter / Socials Mock */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-4">Ikuti Kami</h4>
            <p className="text-xs text-white/60">Dapatkan akses awal ke drop koleksi terbaru dan diskon eksklusif.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email Anda"
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white"
              />
              <button className="bg-white text-primary font-black text-xs px-4 py-2 rounded hover:bg-zinc-100 cursor-pointer transition-colors duration-200">
                JOIN
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-white/50">
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
