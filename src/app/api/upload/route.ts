import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

/**
 * API Route: Unggah Gambar ke Cloudinary
 * POST /api/upload
 * 
 * Payload: { image: string (base64 data URL) }
 * Return: { url: string (https://res.cloudinary.com/...) }
 */
export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { error: "Format gambar tidak valid atau kosong" },
        { status: 400 }
      );
    }

    // Unggah ke Cloudinary
    const imageUrl = await uploadToCloudinary(image, "coreculture_catalog");

    return NextResponse.json({ url: imageUrl }, { status: 200 });
  } catch (error) {
    console.error("API Upload Error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah foto ke Cloudinary" },
      { status: 500 }
    );
  }
}
