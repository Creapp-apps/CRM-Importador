import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

export async function GET(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();

    const customers = await prisma.customer.findMany({
      where: { tenantId: tenantUser.tenantId },
      orderBy: { createdAt: "desc" },
    });

    // Create CSV Header
    const headers = [
      "tipo_cliente",
      "razon_social",
      "nombre_fantasia",
      "cuit",
      "email",
      "telefono",
      "direccion",
      "ciudad",
      "provincia",
      "codigo_postal",
      "saldo_actual"
    ];
    
    let csvContent = headers.join(',') + '\n';

    // Add Data
    for (const c of customers) {
      const row = [
        c.customerType,
        `"${(c.businessName || '').replace(/"/g, '""')}"`,
        `"${(c.tradeName || '').replace(/"/g, '""')}"`,
        c.cuit || '',
        c.email || '',
        c.phone || '',
        `"${(c.address || '').replace(/"/g, '""')}"`,
        `"${(c.city || '').replace(/"/g, '""')}"`,
        `"${(c.province || '').replace(/"/g, '""')}"`,
        c.postalCode || '',
        c.currentBalance.toString()
      ];
      csvContent += row.join(',') + '\n';
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="clientes_export.csv"',
      },
    });

  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error exportando CSV.";
    return new NextResponse(message, { status: 500 });
  }
}
