import { NextResponse } from "next/server";
import { updateCollection, deleteCollection } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Single Collection Operations
 * Path: /api/collections/[id]
 * 
 * PUT    - Memperbarui nama dan deskripsi koleksi (Terproteksi, hanya Admin)
 * DELETE - Menghapus koleksi (Terproteksi, hanya Admin)
 */

export const dynamic = "force-dynamic";

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
    const { name, description } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Nama koleksi tidak boleh kosong" }, { status: 400 });
    }

    const updated = await updateCollection(id, name.trim(), (description || "").trim());
    if (!updated) {
      return NextResponse.json({ error: "Koleksi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal memperbarui data koleksi" },
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
    const success = await deleteCollection(id);

    if (!success) {
      return NextResponse.json({ error: "Koleksi tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Koleksi berhasil dihapus" });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus koleksi" },
      { status: 500 }
    );
  }
}
