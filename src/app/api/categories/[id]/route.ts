import { NextResponse } from "next/server";
import { updateCategory, deleteCategory } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Single Category Operations
 * Path: /api/categories/[id]
 * 
 * PUT    - Memperbarui nama kategori (Terproteksi, hanya Admin)
 * DELETE - Menghapus kategori beserta produk terkait (Terproteksi, hanya Admin)
 */

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Proteksi sesi admin
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { name } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama kategori tidak boleh kosong" }, { status: 400 });
    }

    const updated = await updateCategory(id, name.trim());
    if (!updated) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui kategori" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Proteksi sesi admin
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteCategory(id);

    if (!success) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
