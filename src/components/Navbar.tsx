"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

/**
 * Komponen: Navbar Publik
 * 
 * Fitur:
 * - Desain premium transparan dengan efek glassmorphism (backdrop-blur)
 * - Responsif (tampilan mobile menggunakan menu hamburger)
 * - Tautan navigasi bergaya streetwear uppercase
 * - Tombol admin login diskret untuk memudahkan pengujian
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-black tracking-widest text-white hover:text-accent transition-colors duration-200">
              CORECULTURE
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-xs font-semibold tracking-widest text-red-500 hover:text-white transition-colors duration-200 uppercase">
                SALE!
              </Link>
              <Link href="#" className="text-xs font-semibold tracking-widest text-gray-300 hover:text-white transition-colors duration-200 uppercase">
                SHOP
              </Link>
              <Link href="#" className="text-xs font-semibold tracking-widest text-gray-300 hover:text-white transition-colors duration-200 uppercase">
                COLLECTIONS
              </Link>
              <Link href="#" className="text-xs font-semibold tracking-widest text-gray-300 hover:text-white transition-colors duration-200 uppercase">
                NEW ARRIVALS
              </Link>
              {/* Shortcut diskret ke halaman admin */}
              <Link href="/admin/login" className="text-xs font-semibold tracking-widest text-gray-500 hover:text-accent transition-colors duration-200 uppercase">
                ADMIN PANEL
              </Link>
            </div>
          </div>

          {/* Icons (Search, Admin/User, Bag) */}
          <div className="hidden md:flex items-center space-x-6 text-gray-300">
            <button className="hover:text-white cursor-pointer transition-colors duration-200" title="Cari">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/admin/login" className="hover:text-white transition-colors duration-200" title="Admin Login">
              <User className="h-5 w-5" />
            </Link>
            <button className="hover:text-white cursor-pointer transition-colors duration-200 relative" title="Keranjang">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-black">
                0
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-zinc-900 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 border-b border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 px-2 pb-6 pt-4 sm:px-3">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-red-500 hover:bg-zinc-900 uppercase"
            >
              SALE!
            </Link>
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-gray-300 hover:bg-zinc-900 hover:text-white uppercase"
            >
              SHOP
            </Link>
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-gray-300 hover:bg-zinc-900 hover:text-white uppercase"
            >
              COLLECTIONS
            </Link>
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-gray-300 hover:bg-zinc-900 hover:text-white uppercase"
            >
              NEW ARRIVALS
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-accent hover:bg-zinc-900 uppercase"
            >
              ADMIN PANEL
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
