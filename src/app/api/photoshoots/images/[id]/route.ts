import { NextResponse } from "next/server";
import { deletePhotoshootImage } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Delete Single Photoshoot Image
 * Path: /api/photoshoots/images/[id]
 */

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
