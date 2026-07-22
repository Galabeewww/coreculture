import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isPrismaConfigured } from "@/lib/db";
import prisma from "@/lib/prisma";

/**
 * API Route: Login Admin
 * POST /api/auth/login
 * 
 * Syarat Baru:
 * - Hanya berfungsi jika database PostgreSQL/Supabase sudah terhubung (DATABASE_URL dikonfigurasi).
 * - Jika database belum terhubung, menolak login dengan pesan error 503 Service Unavailable.
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

    // 2. Validasi Kredensial Admin (admin / admin)
    if (username === "admin" && password === "admin") {
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
