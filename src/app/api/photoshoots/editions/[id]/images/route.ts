import { NextResponse } from "next/server";
import { addPhotoshootImages } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Add Images to Photoshoot Edition
 * Path: /api/photoshoots/editions/[id]/images
 */

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
    const body = await request.json();
    const { imageUrls } = body;

    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Minimal 1 gambar wajib diunggah (direkomendasikan 3-5 gambar)" },
        { status: 400 }
      );
    }

    const newPhotos = await addPhotoshootImages(id, imageUrls);
    return NextResponse.json(newPhotos, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menambahkan foto ke edisi" },
      { status: 400 }
    );
  }
}
