import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * API Route: Logout Admin
 * POST /api/auth/logout
 * 
 * Fitur: Menghapus cookie sesi admin untuk keluar dari panel admin.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("coreculture_session");
    
    return NextResponse.json({ success: true, message: "Berhasil logout" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Gagal memproses logout" },
      { status: 500 }
    );
  }
}
