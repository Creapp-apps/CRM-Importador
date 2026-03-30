import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantUser = await requireTenantUser();
    const { id } = await params;

    const customer = await prisma.customer.findUnique({
      where: {
        id,
        tenantId: tenantUser.tenantId,
      },
      include: {
        category: true,
      },
    });

    if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

    return NextResponse.json(customer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching customer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantUser = await requireTenantUser();
    const { id } = await params;
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

    const customer = await prisma.customer.update({
      where: {
        id,
        tenantId: tenantUser.tenantId,
      },
      data: {
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
    });

    return NextResponse.json(customer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating customer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantUser = await requireTenantUser();
    const { id } = await params;

    await prisma.customer.delete({
      where: {
        id,
        tenantId: tenantUser.tenantId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting customer";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
