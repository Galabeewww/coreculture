import { NextResponse } from "next/server";
import { getCollections, createCollection } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Collections Collection
 * Path: /api/collections
 * 
 * GET  - Mendapatkan seluruh daftar koleksi (Publik, untuk filter & menu)
 * POST - Menambahkan koleksi baru (Terproteksi, hanya Admin)
 */

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collections = await getCollections();
    return NextResponse.json(collections);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data koleksi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Proteksi sesi admin
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama koleksi tidak boleh kosong" }, { status: 400 });
    }

    const newCollection = await createCollection(name.trim(), (description || "").trim());
    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat koleksi baru" },
      { status: 500 }
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

    const { deleteAllCollections } = await import("@/lib/db");
    await deleteAllCollections();
    return NextResponse.json({ success: true, message: "Semua koleksi berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus semua koleksi" },
      { status: 500 }
    );
  }
}

