import { NextResponse } from "next/server";
import { deletePhotoshootEdition } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Delete Photoshoot Edition
 * Path: /api/photoshoots/editions/[id]
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
