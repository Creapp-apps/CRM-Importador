import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();

    const rules = await prisma.priceRule.findMany({
      where: { tenantId: tenantUser.tenantId },
      include: {
        customer: { select: { tradeName: true, businessName: true } },
        category: { select: { name: true } },
        product: { select: { name: true } },
        presentation: { select: { name: true } },
      },
      orderBy: [{ priority: "desc" }, { validFrom: "desc" }],
    });

    return NextResponse.json(rules);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading price rules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();

    const {
      name,
      customerId,
      customerCategoryId,
      productId,
      presentationId,
      ruleType,
      value,
      validFrom,
      validUntil,
      priority,
      isActive,
    } = body;

    if (!name || !ruleType || value === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (nombre, tipo y valor)" },
        { status: 400 }
      );
    }

    const rule = await prisma.priceRule.create({
      data: {
        tenantId: tenantUser.tenantId,
        name,
        customerId: customerId || null,
        customerCategoryId: customerCategoryId || null,
        productId: productId || null,
        presentationId: presentationId || null,
        ruleType,
        value: Number(value),
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        priority: priority ? parseInt(priority, 10) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creando regla de precio";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
