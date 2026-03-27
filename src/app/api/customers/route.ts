import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

// GET /api/customers — list all customers for the current tenant
export async function GET() {
  try {
    const tenantUser = await requireTenantUser();

    const customers = await prisma.customer.findMany({
      where: { tenantId: tenantUser.tenantId },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading customers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/customers — create a new customer
export async function POST(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();

    const {
      customerType,
      businessName,
      tradeName,
      cuit,
      contactName,
      contactRole,
      acquisitionChannel,
      email,
      phone,
      address,
      city,
      province,
      postalCode,
      categoryId,
      salesChannel,
      creditLimit,
      notes
    } = body;

    if (!businessName) {
      return NextResponse.json(
        { error: "La Razón Social / Nombre es requerido" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        tenantId: tenantUser.tenantId,
        customerType: customerType || "BUSINESS",
        businessName,
        tradeName,
        cuit,
        contactName,
        contactRole,
        acquisitionChannel,
        email,
        phone,
        address,
        city,
        province,
        postalCode,
        categoryId: categoryId || null,
        salesChannel: salesChannel || null,
        creditLimit: creditLimit ? Number(creditLimit) : null,
        notes,
      },
      include: {
        category: {
          select: { name: true, color: true }
        }
      }
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating customer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
