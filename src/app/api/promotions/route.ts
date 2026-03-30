import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();

    const promotions = await prisma.promotion.findMany({
      where: { tenantId: tenantUser.tenantId },
      orderBy: [{ validFrom: "desc" }],
    });

    return NextResponse.json(promotions);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading promotions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();

    const {
      name,
      description,
      type,
      value,
      minQuantity,
      minAmount,
      appliesToAll,
      productIds,
      categoryIds,
      validFrom,
      validUntil,
      isActive,
    } = body;

    if (!name || !type || value === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (nombre, tipo, valor, fechas validez)" },
        { status: 400 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        tenantId: tenantUser.tenantId,
        name,
        description: description || null,
        type,
        value: Number(value),
        minQuantity: minQuantity ? parseInt(minQuantity, 10) : null,
        minAmount: minAmount ? Number(minAmount) : null,
        appliesToAll: appliesToAll !== undefined ? appliesToAll : false,
        productIds: Array.isArray(productIds) ? productIds : [],
        categoryIds: Array.isArray(categoryIds) ? categoryIds : [],
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(promotion, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creando promoción";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
