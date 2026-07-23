import { NextResponse } from "next/server";
import { getActiveEditionPhotos } from "@/lib/db";

/**
 * API Route: Photoshoots Backward Compatibility Route
 * Path: /api/photoshoots
 */

export async function GET() {
  try {
    const activeEdition = await getActiveEditionPhotos();
    return NextResponse.json(activeEdition?.photos || []);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data photoshoot" },
      { status: 500 }
    );
  }
}
