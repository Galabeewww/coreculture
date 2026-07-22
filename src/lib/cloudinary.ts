import { v2 as cloudinary } from "cloudinary";

/**
 * Konfigurasi SDK Cloudinary
 * Menggunakan variabel lingkungan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Helper fungsi untuk mengunggah berkas gambar (Base64 atau Data URL) ke Cloudinary
 */
export async function uploadToCloudinary(fileString: string, folderName = "coreculture_products"): Promise<string> {
  // Jika kredensial Cloudinary belum diatur di .env, kembalikan gambar asli (Data URL/Base64) agar dev lokal tetap berjalan
  if (
    !process.env.CLOUDINARY_CLOUD_NAME &&
    !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  ) {
    console.warn("Cloudinary credentials missing in .env. Falling back to inline image.");
    return fileString;
  }

  try {
    const response = await cloudinary.uploader.upload(fileString, {
      folder: folderName,
      transformation: [{ width: 1000, height: 1250, crop: "limit", quality: "auto" }],
    });
    return response.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    // Graceful fallback
    return fileString;
  }
}
