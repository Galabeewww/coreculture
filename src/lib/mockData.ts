import { Category, Collection, Product } from "@/types";

// Kategori awal untuk katalog streetwear CORECULTURE
export const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Baju", slug: "baju" },
  { id: "cat-2", name: "Celana", slug: "celana" },
  { id: "cat-3", name: "Jaket", slug: "jaket" },
  { id: "cat-4", name: "Aksesoris", slug: "aksesoris" }
];

// Koleksi awal bertema kolaborasi eksklusif
export const INITIAL_COLLECTIONS: Collection[] = [
  { 
    id: "col-1", 
    name: "Croire Collaboration", 
    slug: "croire-collaboration", 
    description: "Rilisan streetwear eksklusif hasil kolaborasi dengan label fashion indie Croire. Menampilkan warna monokromatik dan potongan avant-garde." 
  },
  { 
    id: "col-2", 
    name: "Cyberpunk Syndicate", 
    slug: "cyberpunk-syndicate", 
    description: "Koleksi bertema distopia urban futuristik dengan detail grafis reflektif dan siluet techwear taktis." 
  }
];

// Produk awal bertema streetwear premium dengan gambar depan dan belakang dari Unsplash
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "CORE Heavyweight Oversized Tee",
    slug: "core-heavyweight-oversized-tee",
    description: "Kaos oversized berbahan katun 24s heavy cotton premium. Potongan siluet drop shoulder yang kokoh dan nyaman untuk streetwear harian.",
    price: 249000,
    stock: 45,
    imageFront: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600",
    imageBack: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=600",
    sizes: ["S", "M", "L", "XL"],
    categoryId: "cat-1",
    collectionId: "col-1" // terhubung ke kolaborasi Croire
  },
  {
    id: "prod-2",
    name: "CYBER Acid Wash Graphic Tee",
    slug: "cyber-acid-wash-graphic-tee",
    description: "Kaos dengan proses acid wash memberikan efek vintage grunge. Dilengkapi sablon grafis cyber-punk berkualitas tinggi di bagian dada.",
    price: 279000,
    stock: 30,
    imageFront: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
    imageBack: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
    sizes: ["M", "L", "XL"],
    categoryId: "cat-1",
    collectionId: "col-2" // terhubung ke Cyberpunk Syndicate
  },
  {
    id: "prod-3",
    name: "X-TACTICAL Multi-Pocket Cargo",
    slug: "x-tactical-multi-pocket-cargo",
    description: "Celana cargo taktis dengan 6 kantong fungsional. Terbuat dari bahan ripstop katun tebal, dengan tali adjuster di bagian pergelangan kaki.",
    price: 449000,
    stock: 20,
    imageFront: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600",
    imageBack: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600",
    sizes: ["28", "30", "32", "34"],
    categoryId: "cat-2",
    collectionId: null
  },
  {
    id: "prod-4",
    name: "CORE Baggy Denim Pants",
    slug: "core-baggy-denim-pants",
    description: "Celana denim berpotongan baggy / wide-leg dengan warna washed indigo. Nyaman dipakai dengan siluet vintage skate 90-an.",
    price: 499000,
    stock: 25,
    imageFront: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=600",
    imageBack: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600",
    sizes: ["30", "32", "34"],
    categoryId: "cat-2",
    collectionId: null
  },
  {
    id: "prod-5",
    name: "VARSITY Legacy Jacket",
    slug: "varsity-legacy-jacket",
    description: "Jaket Varsity dengan kombinasi bahan wool berkualitas tinggi pada badan dan kulit sintetis premium pada lengan. Detail bordir khas CORECULTURE.",
    price: 689000,
    stock: 12,
    imageFront: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=600",
    imageBack: "https://images.unsplash.com/photo-1611312449412-6cefac5dc3e4?q=80&w=600",
    sizes: ["M", "L", "XL"],
    categoryId: "cat-3",
    collectionId: "col-1" // terhubung ke kolaborasi Croire
  },
  {
    id: "prod-6",
    name: "NEO Graphic Streetwear Hoodie",
    slug: "neo-graphic-streetwear-hoodie",
    description: "Hoodie berbahan cotton fleece tebal (330 gsm) yang sangat lembut di bagian dalam. Grafis cetak high-definition di bagian punggung.",
    price: 429000,
    stock: 18,
    imageFront: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600",
    imageBack: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600",
    sizes: ["S", "M", "L", "XL"],
    categoryId: "cat-3",
    collectionId: null
  },
  {
    id: "prod-7",
    name: "UTILITY Cordura Messenger Bag",
    slug: "utility-cordura-messenger-bag",
    description: "Tas selempang tangguh dari bahan Cordura waterproof. Dilengkapi sistem kompartemen taktis untuk laptop, gawai, dan aksesoris harian Anda.",
    price: 329000,
    stock: 15,
    imageFront: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
    imageBack: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600",
    sizes: ["All Size"],
    categoryId: "cat-4",
    collectionId: null
  },
  {
    id: "prod-8",
    name: "NEON Accent Streetwear Cap",
    slug: "neon-accent-streetwear-cap",
    description: "Topi baseball dengan bordir logo minimalis CORECULTURE berwarna biru dan strap belakang yang dapat disesuaikan.",
    price: 189000,
    stock: 50,
    imageFront: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=600",
    imageBack: "https://images.unsplash.com/photo-1534215754734-18e55d13e346?q=80&w=600",
    sizes: ["All Size"],
    categoryId: "cat-4",
    collectionId: null
  }
];
