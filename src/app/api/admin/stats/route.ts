import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Dashboard Statistics
 * GET /api/admin/stats
 * 
 * Fitur: Mengambil total produk, total kategori, dan total stok untuk dashboard admin.
 * Proteksi: Mengecek status login admin dari cookie sebelum menyajikan data sensitif.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Validasi sesi admin
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memproses data statistik" },
      { status: 500 }
    );
  }
}
