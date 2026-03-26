import { PrismaClient, UserRole, UoMCategory, PlanType } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── 1. Create Tenant ───────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "yerba-importadora" },
    update: {},
    create: {
      name: "Yerba Mate Importadora S.A.",
      slug: "yerba-importadora",
      cuit: "30-71234567-8",
      address: "Av. Corrientes 1234, CABA",
      phone: "+54 11 4567-8901",
      email: "admin@yerbaimportadora.com",
      plan: PlanType.PROFESSIONAL,
    },
  });
  console.log("✅ Tenant created:", tenant.name);

  // ─── 2. Create Admin User ──────────────────────
  const passwordHash = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@yerbaimportadora.com" },
    update: {},
    create: {
      email: "admin@yerbaimportadora.com",
      name: "Admin Principal",
      passwordHash,
    },
  });

  await prisma.tenantUser.upsert({
    where: {
      userId_tenantId: {
        userId: adminUser.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      tenantId: tenant.id,
      role: UserRole.ADMIN,
    },
  });
  console.log("✅ Admin user created: admin@yerbaimportadora.com / admin123");

  // ─── 3. Create additional users ────────────────
  const vendedorHash = await bcrypt.hash("vendedor123", 12);
  const vendedor = await prisma.user.upsert({
    where: { email: "vendedor@yerbaimportadora.com" },
    update: {},
    create: {
      email: "vendedor@yerbaimportadora.com",
      name: "Carlos Vendedor",
      passwordHash: vendedorHash,
    },
  });

  await prisma.tenantUser.upsert({
    where: {
      userId_tenantId: {
        userId: vendedor.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: vendedor.id,
      tenantId: tenant.id,
      role: UserRole.VENDEDOR,
    },
  });
  console.log("✅ Vendedor user created: vendedor@yerbaimportadora.com / vendedor123");

  const depositoHash = await bcrypt.hash("deposito123", 12);
  const deposito = await prisma.user.upsert({
    where: { email: "deposito@yerbaimportadora.com" },
    update: {},
    create: {
      email: "deposito@yerbaimportadora.com",
      name: "María Depósito",
      passwordHash: depositoHash,
    },
  });

  await prisma.tenantUser.upsert({
    where: {
      userId_tenantId: {
        userId: deposito.id,
        tenantId: tenant.id,
      },
    },
    update: {},
    create: {
      userId: deposito.id,
      tenantId: tenant.id,
      role: UserRole.DEPOSITO,
    },
  });
  console.log("✅ Depósito user created: deposito@yerbaimportadora.com / deposito123");

  // ─── 4. Create Units of Measure ────────────────
  const uomPaquete = await prisma.unitOfMeasure.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "paquete" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "paquete",
      symbol: "paq",
      category: UoMCategory.UNIT,
    },
  });

  const uomKg = await prisma.unitOfMeasure.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "kilogramo" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "kilogramo",
      symbol: "kg",
      category: UoMCategory.WEIGHT,
    },
  });

  const uomUnidad = await prisma.unitOfMeasure.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "unidad" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "unidad",
      symbol: "u",
      category: UoMCategory.UNIT,
    },
  });
  console.log("✅ Units of Measure created: paquete, kilogramo, unidad");

  // ─── 5. Create Products with Presentations ─────
  const product1 = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: "YRB-INT-500" } },
    update: {},
    create: {
      tenantId: tenant.id,
      sku: "YRB-INT-500",
      name: "Yerba Sabor Intenso",
      brand: "Terpy",
      category: "Yerba Mate",
      baseUnitId: uomPaquete.id,
      baseUnitWeight: 500,
      currentStock: 2400,
      minimumStock: 200,
    },
  });

  // Presentación: Funda 20 x 500g
  await prisma.productPresentation.create({
    data: {
      tenantId: tenant.id,
      productId: product1.id,
      name: "Funda 20 x 500g",
      shortName: "F20x500",
      barcode: "7790001000010",
      conversionFactor: 20,
      packDescription: "20 paquetes de 500g",
      totalWeightGrams: 10000,
      isDefault: true,
    },
  });

  // Presentación: Funda 20 x 6x70g
  await prisma.productPresentation.create({
    data: {
      tenantId: tenant.id,
      productId: product1.id,
      name: "Funda 20 x 6x70g",
      shortName: "F20x6x70",
      barcode: "7790001000027",
      conversionFactor: 120,
      packDescription: "20 paquetes de 6 unidades de 70g",
      totalWeightGrams: 8400,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: "YRB-CLA-500" } },
    update: {},
    create: {
      tenantId: tenant.id,
      sku: "YRB-CLA-500",
      name: "Yerba Sabor Clásico",
      brand: "Terpy",
      category: "Yerba Mate",
      baseUnitId: uomPaquete.id,
      baseUnitWeight: 500,
      currentStock: 1800,
      minimumStock: 150,
    },
  });

  await prisma.productPresentation.create({
    data: {
      tenantId: tenant.id,
      productId: product2.id,
      name: "Funda 20 x 500g",
      shortName: "F20x500",
      barcode: "7790002000010",
      conversionFactor: 20,
      packDescription: "20 paquetes de 500g",
      totalWeightGrams: 10000,
      isDefault: true,
    },
  });

  const product3 = await prisma.product.upsert({
    where: { tenantId_sku: { tenantId: tenant.id, sku: "YRB-SUA-1K" } },
    update: {},
    create: {
      tenantId: tenant.id,
      sku: "YRB-SUA-1K",
      name: "Yerba Suave Premium",
      brand: "Terpy",
      category: "Yerba Mate",
      baseUnitId: uomPaquete.id,
      baseUnitWeight: 1000,
      currentStock: 600,
      minimumStock: 100,
    },
  });

  await prisma.productPresentation.create({
    data: {
      tenantId: tenant.id,
      productId: product3.id,
      name: "Funda 10 x 1kg",
      shortName: "F10x1K",
      barcode: "7790003000010",
      conversionFactor: 10,
      packDescription: "10 paquetes de 1kg",
      totalWeightGrams: 10000,
      isDefault: true,
    },
  });
  console.log("✅ Products created: Intenso, Clásico, Suave Premium (with presentations)");

  // ─── 6. Create Customer Categories ─────────────
  const catDistribuidor = await prisma.customerCategory.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Distribuidor" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Distribuidor",
      color: "#6366f1",
      discount: 15,
    },
  });

  const catMayorista = await prisma.customerCategory.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Mayorista" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Mayorista",
      color: "#06b6d4",
      discount: 10,
    },
  });

  const catTienda = await prisma.customerCategory.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "Tienda de Mates" } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Tienda de Mates",
      color: "#10b981",
      discount: 5,
    },
  });
  console.log("✅ Customer categories created: Distribuidor, Mayorista, Tienda de Mates");

  // ─── 7. Create Sample Customers ────────────────
  await prisma.customer.upsert({
    where: { id: "seed-customer-1" },
    update: {},
    create: {
      id: "seed-customer-1",
      tenantId: tenant.id,
      businessName: "Distribuidora Norte S.R.L.",
      tradeName: "DistNorte",
      cuit: "30-99887766-5",
      email: "compras@distnorte.com",
      phone: "+54 11 5555-0001",
      address: "Av. San Martín 456",
      city: "Buenos Aires",
      province: "Buenos Aires",
      categoryId: catDistribuidor.id,
      salesChannel: "DISTRIBUTOR",
      creditLimit: 500000,
    },
  });

  await prisma.customer.upsert({
    where: { id: "seed-customer-2" },
    update: {},
    create: {
      id: "seed-customer-2",
      tenantId: tenant.id,
      businessName: "Supermercado El Gaucho",
      tradeName: "El Gaucho",
      cuit: "20-12345678-9",
      email: "ventas@elgaucho.com",
      phone: "+54 11 5555-0002",
      address: "Calle Rivadavia 789",
      city: "Rosario",
      province: "Santa Fe",
      categoryId: catMayorista.id,
      salesChannel: "WHOLESALE",
      creditLimit: 200000,
    },
  });

  await prisma.customer.upsert({
    where: { id: "seed-customer-3" },
    update: {},
    create: {
      id: "seed-customer-3",
      tenantId: tenant.id,
      businessName: "La Casa del Mate",
      tradeName: "Casa Mate",
      cuit: "27-98765432-1",
      email: "info@casamate.com",
      phone: "+54 11 5555-0003",
      address: "Corrientes 1500",
      city: "Buenos Aires",
      province: "Buenos Aires",
      categoryId: catTienda.id,
      salesChannel: "DIRECT",
      creditLimit: 100000,
    },
  });
  console.log("✅ Sample customers created: DistNorte, El Gaucho, Casa del Mate");

  console.log("\n🎉 Seed completed successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin:    admin@yerbaimportadora.com / admin123");
  console.log("   Vendedor: vendedor@yerbaimportadora.com / vendedor123");
  console.log("   Depósito: deposito@yerbaimportadora.com / deposito123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
