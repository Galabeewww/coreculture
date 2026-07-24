import { NextResponse } from "next/server";
import { setActiveEdition } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Set Active Photoshoot Edition
 * Path: /api/photoshoots/editions/[id]/active
 */

export const dynamic = "force-dynamic";

export async function POST(
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
    const updated = await setActiveEdition(id);

    if (!updated) {
      return NextResponse.json({ error: "Edisi photoshoot tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal mengaktifkan edisi photoshoot" },
      { status: 500 }
    );
  }
}
