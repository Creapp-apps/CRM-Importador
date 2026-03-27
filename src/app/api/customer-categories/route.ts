import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

// GET /api/customer-categories — list all customer categories for the current tenant
export async function GET() {
  try {
    const tenantUser = await requireTenantUser();

    const categories = await prisma.customerCategory.findMany({
      where: { tenantId: tenantUser.tenantId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
