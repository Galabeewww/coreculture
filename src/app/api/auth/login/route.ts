import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isPrismaConfigured } from "@/lib/db";
import prisma from "@/lib/prisma";

/**
 * API Route: Login Admin
 * POST /api/auth/login
 * 
 * Syarat:
 * - Memeriksa kredensial dari tabel `users` di database PostgreSQL (pgAdmin 4 / Supabase).
 * - Jika database belum terhubung, menolak login dengan pesan error 503.
 */
export async function POST(request: Request) {
  try {
    // 1. Cek Ketersediaan Database PostgreSQL
    if (!isPrismaConfigured) {
      return NextResponse.json(
        {
          success: false,
          message: "Login ditolak: Database PostgreSQL (pgAdmin4 / Supabase) belum terhubung. Mohon atur DATABASE_URL di file .env.local terlebih dahulu."
        },
        { status: 503 }
      );
    }

    // Tes ping koneksi database Prisma
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbErr) {
      console.error("Gagal terhubung ke PostgreSQL:", dbErr);
      return NextResponse.json(
        {
          success: false,
          message: "Login gagal: Database PostgreSQL tidak dapat dijangkau. Pastikan pgAdmin4 / Supabase aktif."
        },
        { status: 503 }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username dan password tidak boleh kosong" },
        { status: 400 }
      );
    }

    // 2. Validasi Kredensial Admin dari Tabel `users` PostgreSQL
    let user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    // Jika tabel user belum ada akun admin sama sekali, auto-seed admin default
    if (!user && username.trim() === "admin" && password === "admin") {
      try {
        user = await prisma.user.create({
          data: {
            username: "admin",
            password: "admin",
            name: "Administrator",
          },
        });
      } catch (e) {
        console.error("Auto create admin user exception:", e);
      }
    }

    if (user && user.password === password) {
      const cookieStore = await cookies();
      cookieStore.set("coreculture_session", "authenticated_admin", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 2, // 2 Jam sesi aktif
        path: "/",
      });

      return NextResponse.json({ success: true, message: "Login berhasil" });
    }

    return NextResponse.json(
      { success: false, message: "Username atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login Exception:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
