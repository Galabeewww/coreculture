import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Inisialisasi akun login admin...");

  // HANYA seed akun admin
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      password: "admin",
      name: "Administrator",
    },
    create: {
      username: "admin",
      password: "admin",
      name: "Administrator",
    },
  });

  console.log("✅ Seeding akun login admin selesai! (Kategori, koleksi, & produk dikelola via website/admin panel)");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
