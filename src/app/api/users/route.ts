import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

// GET /api/users — get all users in the current tenant
export async function GET(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();

    const users = await prisma.user.findMany({
      where: {
        tenants: {
          some: {
            tenantId: tenantUser.tenantId,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        tenants: {
          where: { tenantId: tenantUser.tenantId },
          select: { role: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading users";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
