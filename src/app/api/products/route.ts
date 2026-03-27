import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

// GET /api/products — list all products for the current tenant
export async function GET() {
  try {
    const tenantUser = await requireTenantUser();

    const products = await prisma.product.findMany({
      where: { tenantId: tenantUser.tenantId },
      include: {
        baseUnit: true,
        presentations: {
          where: { isActive: true },
          orderBy: { isDefault: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/products — create a new product
export async function POST(req: NextRequest) {
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
      presentations,
    } = body;

    if (!sku || !name || !baseUnitId) {
      return NextResponse.json(
        { error: "SKU, nombre y unidad base son requeridos" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        tenantId: tenantUser.tenantId,
        sku,
        name,
        description: description || null,
        brand: brand || null,
        category: category || null,
        baseUnitId,
        baseUnitWeight: baseUnitWeight || null,
        currentStock: currentStock || 0,
        minimumStock: minimumStock || 0,
        presentations: presentations?.length
          ? {
              create: presentations.map(
                (p: {
                  name: string;
                  shortName?: string;
                  barcode?: string;
                  conversionFactor: number;
                  packDescription?: string;
                  totalWeightGrams?: number;
                  isDefault?: boolean;
                }) => ({
                  tenantId: tenantUser.tenantId,
                  name: p.name,
                  shortName: p.shortName || null,
                  barcode: p.barcode || null,
                  conversionFactor: p.conversionFactor,
                  packDescription: p.packDescription || null,
                  totalWeightGrams: p.totalWeightGrams || null,
                  isDefault: p.isDefault || false,
                })
              ),
            }
          : undefined,
      },
      include: {
        baseUnit: true,
        presentations: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese SKU" },
        { status: 409 }
      );
    }
    const message = error instanceof Error ? error.message : "Error creating product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
