/**
 * Helper Utility: Kompresi Gambar Client-Side
 * Mengubah berkas gambar (File) menjadi Web-Optimized Base64 Data URL
 * tanpa merusak aspect ratio asli.
 */

export function compressImageFile(file: File, maxWidth = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    // Jika bukan berkas gambar, lempar kesalahan
    if (!file.type.startsWith("image/")) {
      return reject(new Error("Berkas harus berupa gambar"));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca berkas gambar"));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat format gambar"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Pertahankan aspect ratio asli 100%
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return resolve(event.target?.result as string);
        }

        // Gambar ulang di canvas untuk kompresi
        ctx.drawImage(img, 0, 0, width, height);

        // Hasilkan Data URL JPEG berkualitas web-optimized
        const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedBase64);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
