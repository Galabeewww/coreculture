import { NextResponse } from "next/server";
import { updatePhotoshootImage, deletePhotoshootImage } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Single Photoshoot Image Operations
 * Path: /api/photoshoots/images/[id]
 *
 * PUT    - Ganti gambar foto (Admin)
 * DELETE - Hapus foto (Admin)
 */

export const dynamic = "force-dynamic";

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
    const { imageUrl } = body;

    if (!imageUrl || !imageUrl.trim()) {
      return NextResponse.json(
        { error: "URL gambar baru wajib diisi" },
        { status: 400 }
      );
    }

    const updated = await updatePhotoshootImage(id, imageUrl.trim());

    if (!updated) {
      return NextResponse.json({ error: "Foto photoshoot tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui foto" },
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
    const success = await deletePhotoshootImage(id);

    if (!success) {
      return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Foto berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus foto" },
      { status: 500 }
    );
  }
}
