import { NextResponse } from "next/server";
import { getPhotoshootEditions, createPhotoshootEdition } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Photoshoot Editions List & Create
 * Path: /api/photoshoots/editions
 */

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const editions = await getPhotoshootEditions();
    return NextResponse.json(editions);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Gagal mengambil data edisi photoshoot" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama edisi photoshoot wajib diisi (contoh: Vol.3)" },
        { status: 400 }
      );
    }

    const newEdition = await createPhotoshootEdition(name.trim());
    return NextResponse.json(newEdition, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal membuat edisi photoshoot baru" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deleteAllPhotoshootEditions } = await import("@/lib/db");
    await deleteAllPhotoshootEditions();
    return NextResponse.json({ success: true, message: "Semua edisi photoshoot berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus semua edisi photoshoot" },
      { status: 500 }
    );
  }
}

