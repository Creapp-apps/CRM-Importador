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
