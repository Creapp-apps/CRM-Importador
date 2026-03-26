import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

// GET /api/orders — list all orders for the current tenant
export async function GET(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    
    // Optional query param: status
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const orders = await prisma.order.findMany({
      where: { 
        tenantId: tenantUser.tenantId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        customer: { select: { tradeName: true, businessName: true } },
        items: {
          include: {
            presentation: { include: { product: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading orders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/orders — create a new order
export async function POST(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();

    const {
      customerId,
      status,
      discountTotal,
      taxTotal,
      notes,
      items, // array of { presentationId, quantity, unitPrice, discount }
    } = body;

    if (!customerId || !items || !items.length) {
      return NextResponse.json(
        { error: "Cliente e items son requeridos" },
        { status: 400 }
      );
    }

    // Generate an order number (e.g. ORD-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const orderNumber = `ORD-${dateStr}-${randomHex}`;

    // Get presentations to calculate baseUnitsTotal
    const presentationIds = items.map((i: any) => i.presentationId);
    const presentations = await prisma.productPresentation.findMany({
      where: { id: { in: presentationIds }, tenantId: tenantUser.tenantId },
    });

    const presMap = new Map(presentations.map(p => [p.id, p]));

    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const pres = presMap.get(item.presentationId);
      if (!pres) throw new Error(`Presentación no encontrada: ${item.presentationId}`);

      const itemSubtotal = (Number(item.quantity) * Number(item.unitPrice)) - Number(item.discount || 0);
      subtotal += itemSubtotal;

      return {
        presentationId: item.presentationId,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        subtotal: itemSubtotal,
        baseUnitsTotal: Number(item.quantity) * Number(pres.conversionFactor),
      };
    });

    const total = subtotal - Number(discountTotal || 0) + Number(taxTotal || 0);

    const order = await prisma.order.create({
      data: {
        tenantId: tenantUser.tenantId,
        orderNumber,
        customerId,
        status: status || "DRAFT",
        subtotal,
        discountTotal: discountTotal || 0,
        taxTotal: taxTotal || 0,
        total,
        notes: notes || null,
        createdById: tenantUser.user.id,
        createdByName: tenantUser.user.name,
        items: {
          create: processedItems,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
