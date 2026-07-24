import { NextResponse } from "next/server";
import { getActiveEditionPhotos } from "@/lib/db";

/**
 * API Route: Active Photoshoot Edition (Public)
 * Path: /api/photoshoots/active
 */

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeEdition = await getActiveEditionPhotos();
    return NextResponse.json(activeEdition);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil edisi photoshoot aktif" },
      { status: 500 }
    );
  }
}
