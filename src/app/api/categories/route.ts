import { NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Categories Collection
 * Path: /api/categories
 * 
 * GET  - Mendapatkan seluruh kategori (Publik, untuk filter katalog)
 * POST - Menambahkan kategori baru (Terproteksi, hanya Admin)
 */

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data kategori" },
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

    const { name } = await request.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama kategori tidak boleh kosong" }, { status: 400 });
    }

    const newCategory = await createCategory(name.trim());
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat kategori baru" },
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

    const { deleteAllCategories } = await import("@/lib/db");
    await deleteAllCategories();
    return NextResponse.json({ success: true, message: "Semua kategori berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus semua kategori" },
      { status: 500 }
    );
  }
}

