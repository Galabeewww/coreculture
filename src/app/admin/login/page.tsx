"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock, User } from "lucide-react";

/**
 * Halaman: Login Admin
 * Path: /admin/login
 * 
 * Diperbarui ke tema warna baru: Canvas Putih dengan aksen #002D72 (Deep Blue).
 */
export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.message || "Username atau password salah");
      }
    } catch (err) {
      setError("Koneksi gagal. Silakan coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 sm:px-6 lg:px-8">
      {/* Box Login */}
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl border border-zinc-200 shadow-2xl relative overflow-hidden animate-scale-in">
        
        {/* Line Aksen Deep Blue */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary" />

        {/* Header Form */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-widest uppercase">
            CORECULTURE ADMIN
          </h2>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Security Gateway / Panel Administrasi
          </p>
        </div>

        {/* Feedback Pesan Error */}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            {/* Input Username */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username Admin"
                className="w-full bg-white border border-zinc-200 rounded pl-10 pr-3 py-3 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Input Password */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-zinc-400" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password Admin"
                className="w-full bg-white border border-zinc-200 rounded pl-10 pr-3 py-3 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Tombol Kirim */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded bg-primary py-3.5 px-4 text-xs font-black text-white uppercase tracking-widest hover:bg-primary-hover cursor-pointer transition-all duration-300 transform hover:scale-[1.01]"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="flex items-center gap-2">
                  MASUK <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Tautan Kembali */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-[10px] font-bold text-zinc-400 hover:text-primary uppercase tracking-widest transition-colors duration-200"
          >
            ← Kembali ke Katalog Publik
          </Link>
        </div>

      </div>
    </div>
  );
}
