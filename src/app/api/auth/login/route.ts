import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * API Route: Login Admin
 * POST /api/auth/login
 * 
 * Fitur: Validasi username dan password, serta menyetel HTTP-only cookie untuk sesi.
 */
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validasi kredensial (admin / admin) sesuai instruksi
    if (username === "admin" && password === "admin") {
      // Setel cookie dengan opsi keamanan (HTTP-only, Secure di prod, SameSite Lax)
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
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
