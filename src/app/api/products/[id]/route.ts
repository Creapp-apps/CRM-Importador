import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantUser = await requireTenantUser();

    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        tenantId: tenantUser.tenantId,
      },
      include: {
        baseUnit: true,
        presentations: true,
      },
    });

    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(product);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();

    const {
      sku,
      name,
      description,
      brand,
      category,
      baseUnitId,
      baseUnitWeight,
      currentStock,
      minimumStock,
      isActive,
      presentations,
    } = body;

    // Use transaction to update product and presentations
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update product main info
      const product = await tx.product.update({
        where: { id: params.id, tenantId: tenantUser.tenantId },
        data: {
          sku,
          name,
          description: description || null,
          brand: brand || null,
          category: category || null,
          baseUnitId,
          baseUnitWeight: baseUnitWeight || null,
          currentStock: currentStock !== undefined ? Number(currentStock) : undefined,
          minimumStock: minimumStock !== undefined ? Number(minimumStock) : undefined,
          isActive: isActive !== undefined ? isActive : undefined,
        },
      });

      // 2. Diff presentations
      if (presentations) {
        // Find existing to know what to delete
        const existing = await tx.productPresentation.findMany({
          where: { productId: params.id, tenantId: tenantUser.tenantId },
          select: { id: true },
        });

        const incomingIds = presentations.map((p: any) => p.id).filter(Boolean);
        const toDeleteIds = existing.map(e => e.id).filter(id => !incomingIds.includes(id));

        // Delete removed ones
        if (toDeleteIds.length > 0) {
          await tx.productPresentation.deleteMany({
            where: { id: { in: toDeleteIds }, tenantId: tenantUser.tenantId },
          });
        }

        // Upsert incoming
        for (const p of presentations) {
          if (p.id) {
            await tx.productPresentation.update({
              where: { id: p.id, tenantId: tenantUser.tenantId },
              data: {
                name: p.name,
                shortName: p.shortName || null,
                barcode: p.barcode || null,
                conversionFactor: p.conversionFactor,
                packDescription: p.packDescription || null,
                isDefault: p.isDefault || false,
              },
            });
          } else {
            await tx.productPresentation.create({
              data: {
                tenantId: tenantUser.tenantId,
                productId: product.id,
                name: p.name,
                shortName: p.shortName || null,
                barcode: p.barcode || null,
                conversionFactor: p.conversionFactor,
                packDescription: p.packDescription || null,
                isDefault: p.isDefault || false,
              },
            });
          }
        }
      }

      return product;
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantUser = await requireTenantUser();

    await prisma.product.delete({
      where: {
        id: params.id,
        tenantId: tenantUser.tenantId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
