"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";

/**
 * Komponen: Navbar Publik
 * 
 * Fitur:
 * - Desain premium transparan berbasis warna #FFFFFF dengan efek glassmorphism.
 * - Navigasi teks berwarna gelap dengan hover #002D72.
 * - Responsif (tampilan mobile menggunakan menu hamburger).
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo / Brand Name */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-black tracking-widest text-primary hover:opacity-80 transition-opacity duration-200">
              CORECULTURE
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-xs font-black tracking-widest text-red-600 hover:text-primary transition-colors duration-200 uppercase">
                SALE!
              </Link>
              <Link href="#" className="text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase">
                SHOP
              </Link>
              <Link href="#" className="text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase">
                COLLECTIONS
              </Link>
              <Link href="#" className="text-xs font-semibold tracking-widest text-zinc-600 hover:text-primary transition-colors duration-200 uppercase">
                NEW ARRIVALS
              </Link>
              <Link href="/admin/login" className="text-xs font-bold tracking-widest text-zinc-400 hover:text-primary transition-colors duration-200 uppercase">
                ADMIN PANEL
              </Link>
            </div>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6 text-zinc-600">
            <button className="hover:text-primary cursor-pointer transition-colors duration-200" title="Cari">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/admin/login" className="hover:text-primary transition-colors duration-200" title="Admin Login">
              <User className="h-5 w-5" />
            </Link>
            <button className="hover:text-primary cursor-pointer transition-colors duration-200 relative" title="Keranjang">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                0
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-primary focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-zinc-200 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1 px-2 pb-6 pt-4 sm:px-3">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-black tracking-widest text-red-600 hover:bg-zinc-50 uppercase"
            >
              SALE!
            </Link>
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-primary uppercase"
            >
              SHOP
            </Link>
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-primary uppercase"
            >
              COLLECTIONS
            </Link>
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-primary uppercase"
            >
              NEW ARRIVALS
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-semibold tracking-widest text-primary hover:bg-zinc-50 uppercase"
            >
              ADMIN PANEL
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
