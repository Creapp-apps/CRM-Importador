import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();

    const invoices = await prisma.invoice.findMany({
      where: { tenantId: tenantUser.tenantId },
      include: {
        order: {
          select: { orderNumber: true, customer: { select: { businessName: true, cuit: true } } },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading invoices";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();

    const { orderId, receiptType, total } = body;

    if (!orderId || !receiptType || !total) {
      return NextResponse.json({ error: "Datos faltantes" }, { status: 400 });
    }

    // SIMULATED AFIP INTEGRATION
    // Here we would call the AFIP SDK with the tenant's certificates

    const simulatedCaE = `CAE${Math.floor(Math.random() * 100000000000000)}`;
    const simulatedInvoiceNumber = `0001-${Math.floor(Math.random() * 1000000).toString().padStart(8, '0')}`;
    
    const invoice = await prisma.$transaction(async (tx) => {
      // Create Invoice
      const inv = await tx.invoice.create({
        data: {
          tenantId: tenantUser.tenantId,
          orderId,
          type: receiptType === 1 ? 'FACTURA_A' : receiptType === 6 ? 'FACTURA_B' : 'FACTURA_C',
          total: Number(total),
          subtotal: Number(total) / 1.21,
          invoiceNumber: simulatedInvoiceNumber,
          afipCae: simulatedCaE,
          afipCaeExpiry: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
          status: "ISSUED",
          customerId: body.customerId || "customer-1", // Will need real mapping
        },
      });

      // Update Order Status
      await tx.order.update({
        where: { id: orderId, tenantId: tenantUser.tenantId },
        data: { status: "INVOICED" },
      });

      return inv;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error generating invoice at AFIP";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
