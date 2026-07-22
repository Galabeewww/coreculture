import { NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";
import { cookies } from "next/headers";

/**
 * API Route: Products Collection
 * Path: /api/products
 * 
 * GET  - Mendapatkan seluruh produk (Publik, untuk halaman katalog)
 * POST - Menambahkan produk baru (Terproteksi, hanya Admin)
 */

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data produk" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Proteksi sesi admin
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("coreculture_session");
    if (!sessionToken || sessionToken.value !== "authenticated_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, stock, imageFront, imageBack, sizes, categoryId } = body;

    // Validasi data input
    if (!name || !price || !categoryId || stock === undefined || !imageFront || !imageBack) {
      return NextResponse.json(
        { error: "Atribut wajib produk tidak lengkap (nama, harga, kategori, stok, gambar depan & belakang)" },
        { status: 400 }
      );
    }

    const newProduct = await createProduct({
      name: name.trim(),
      description: (description || "").trim(),
      price: Number(price),
      stock: Number(stock),
      imageFront: imageFront.trim(),
      imageBack: imageBack.trim(),
      sizes: Array.isArray(sizes) ? sizes : ["All Size"],
      categoryId
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat produk baru" },
      { status: 500 }
    );
  }
}
