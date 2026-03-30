import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

// GET /api/uom — list all units of measure for the current tenant
export async function GET() {
  try {
    const tenantUser = await requireTenantUser();

    const uoms = await prisma.unitOfMeasure.findMany({
      where: { tenantId: tenantUser.tenantId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(uoms);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading units";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const tenantUser = await requireTenantUser();
    if (tenantUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Only admins can create UoMs" }, { status: 403 });
    }

    const json = await req.json();
    const { name, symbol, category } = json;

    if (!name || !symbol || !category) {
      return NextResponse.json({ error: "Name, symbol and category are required" }, { status: 400 });
    }

    const existing = await prisma.unitOfMeasure.findUnique({
      where: {
        tenantId_name: { tenantId: tenantUser.tenantId, name }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "A unit of measure with this name already exists" }, { status: 400 });
    }

    const uom = await prisma.unitOfMeasure.create({
      data: {
        tenantId: tenantUser.tenantId,
        name,
        symbol,
        category,
      }
    });

    return NextResponse.json(uom);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating unit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
