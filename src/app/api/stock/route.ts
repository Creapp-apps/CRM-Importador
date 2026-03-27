import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

// GET /api/stock — get recent stock movements
export async function GET(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();

    // Optional: filter by productId
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const movements = await prisma.stockMovement.findMany({
      where: {
        tenantId: tenantUser.tenantId,
        ...(productId ? { productId } : {}),
      },
      include: {
        product: { select: { sku: true, name: true, baseUnit: { select: { symbol: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100, // Limit to last 100 for now
    });

    return NextResponse.json(movements);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading stock movements";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/stock — create a manual stock movement
export async function POST(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();

    const { productId, type, quantity, reason } = body;

    if (!productId || !type || !quantity || Number(quantity) <= 0) {
      return NextResponse.json(
        { error: "Faltan campos o cantidad inválida" },
        { status: 400 }
      );
    }

    const qtyNumber = Number(quantity);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current product to know its current stock
      const product = await tx.product.findUnique({
        where: { id: productId, tenantId: tenantUser.tenantId },
      });

      if (!product) throw new Error("Producto no encontrado");

      // 2. Calculate new stock
      let stockChange = 0;
      if (type === "IN") {
        stockChange = qtyNumber;
      } else if (type === "OUT") {
        stockChange = -qtyNumber;
        if (Number(product.currentStock) < qtyNumber) {
          throw new Error("Stock insuficiente para realizar la salida");
        }
      } else if (type === "ADJUSTMENT") {
        // For absolute adjustment, calculate the difference
        stockChange = qtyNumber - Number(product.currentStock);
      } else {
        throw new Error("Tipo de movimiento inválido");
      }

      // 3. Update product
      if (stockChange !== 0) {
        await tx.product.update({
          where: { id: productId },
          data: {
            currentStock: {
              increment: stockChange,
            },
          },
        });
      }

      // 4. Create movement record
      const movement = await tx.stockMovement.create({
        data: {
          tenantId: tenantUser.tenantId,
          productId,
          type,
          quantity: type === "ADJUSTMENT" ? stockChange : qtyNumber,
          reason: reason || "Ajuste manual",
          referenceType: "MANUAL",
          createdById: tenantUser.user.id,
          createdByName: tenantUser.user.name,
        },
      });

      return movement;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error processing stock movement";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
