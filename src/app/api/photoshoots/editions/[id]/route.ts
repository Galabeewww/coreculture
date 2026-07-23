import { NextResponse } from "next/server";
import { updatePhotoshootEdition, deletePhotoshootEdition } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Single Photoshoot Edition Operations
 * Path: /api/photoshoots/editions/[id]
 *
 * PUT    - Update nama edisi (Admin)
 * DELETE - Hapus edisi beserta semua fotonya (Admin)
 */

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama edisi wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await updatePhotoshootEdition(id, name.trim());

    if (!updated) {
      return NextResponse.json({ error: "Edisi photoshoot tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui edisi photoshoot" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const success = await deletePhotoshootEdition(id);

    if (!success) {
      return NextResponse.json({ error: "Edisi photoshoot tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Edisi photoshoot berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus edisi photoshoot" },
      { status: 500 }
    );
  }
}
