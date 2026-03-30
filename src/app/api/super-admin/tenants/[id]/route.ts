import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireSuperAdmin() {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || !(session.user as any)?.isSuperAdmin) {
    throw new Error("Unauthorized");
  }
  return session;
}

// GET /api/super-admin/tenants/[id] — get tenant detail with users, counts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            products: true,
            customers: true,
            orders: true,
            routes: true,
            priceRules: true,
            invoices: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json(tenant);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PUT /api/super-admin/tenants/[id] — update tenant
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;
    const body = await req.json();

    const {
      name, slug, cuit, email, phone, address, plan, isActive,
      afipPuntoVenta, afipEnvironment, logisticBaseAddress,
    } = body;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(cuit !== undefined && { cuit: cuit || null }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(address !== undefined && { address: address || null }),
        ...(plan !== undefined && { plan }),
        ...(isActive !== undefined && { isActive }),
        ...(afipPuntoVenta !== undefined && { afipPuntoVenta: afipPuntoVenta ? Number(afipPuntoVenta) : null }),
        ...(afipEnvironment !== undefined && { afipEnvironment }),
        ...(logisticBaseAddress !== undefined && { logisticBaseAddress: logisticBaseAddress || null }),
      },
    });

    return NextResponse.json(tenant);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating tenant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/super-admin/tenants/[id] — delete tenant (cascade)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Delete tenant — cascade will clean up all related data
    await prisma.tenant.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting tenant";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
