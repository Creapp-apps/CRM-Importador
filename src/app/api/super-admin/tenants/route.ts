import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireSuperAdmin() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || !(session.user as any)?.isSuperAdmin) {
    throw new Error("Unauthorized");
  }
  return session;
}

// GET /api/super-admin/tenants
export async function GET() {
  try {
    await requireSuperAdmin();
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { users: true, products: true, customers: true, orders: true } },
      },
    });
    return NextResponse.json(tenants);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// POST /api/super-admin/tenants — create tenant + admin user
export async function POST(req: NextRequest) {
  try {
    await requireSuperAdmin();
    const body = await req.json();

    const { name, slug, cuit, email, phone, address, plan, adminName, adminEmail, adminPassword } = body;

    if (!name || !slug || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    if (adminPassword.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        cuit: cuit || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        plan: plan || "STARTER",
      },
    });

    // Create admin user
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const user = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: adminName,
        passwordHash,
      },
    });

    // Link user to tenant as ADMIN
    await prisma.tenantUser.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role: "ADMIN",
      },
    });

    // Create default UoMs for the tenant
    const defaultUoMs = [
      { name: "paquete", symbol: "paq", category: "UNIT" as const },
      { name: "kilogramo", symbol: "kg", category: "WEIGHT" as const },
      { name: "unidad", symbol: "u", category: "UNIT" as const },
      { name: "litro", symbol: "L", category: "VOLUME" as const },
    ];

    await prisma.unitOfMeasure.createMany({
      data: defaultUoMs.map(u => ({ ...u, tenantId: tenant.id })),
      skipDuplicates: true,
    });

    // Create default customer categories
    await prisma.customerCategory.createMany({
      data: [
        { tenantId: tenant.id, name: "Distribuidor", color: "#8b5cf6", discount: 15 },
        { tenantId: tenant.id, name: "Mayorista", color: "#06b6d4", discount: 10 },
        { tenantId: tenant.id, name: "Minorista", color: "#10b981", discount: 5 },
      ],
      skipDuplicates: true,
    });

    return NextResponse.json({ tenant, user }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ya existe una importadora con ese slug o un usuario con ese email" }, { status: 409 });
    }
    const message = error instanceof Error ? error.message : "Error creating tenant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
