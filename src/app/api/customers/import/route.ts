import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";
import { CustomerType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();
    const { csvContent } = body;

    if (!csvContent || typeof csvContent !== 'string') {
      return NextResponse.json({ error: "Archivo CSV inválido o vacío." }, { status: 400 });
    }

    // Parse CSV (simple parser for typical CSV)
    const lines = csvContent.split(/\r?\n/).filter((line: string) => line.trim() !== '');
    if (lines.length <= 1) {
      return NextResponse.json({ error: "El archivo no contiene filas de datos." }, { status: 400 });
    }

    // Split headers handling optional quotes
    const headers = lines[0].split(',').map((h: string) => h.trim().replace(/^"|"$/g, ''));
    
    // Validate we have the minimum headers
    const requiredHeaders = ['razon_social'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return NextResponse.json({ error: `Faltan columnas obligatorias: ${missingHeaders.join(', ')}` }, { status: 400 });
    }

    const newCustomers: any[] = [];

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      // Simple split by comma, ignoring commas inside quotes is hard with simple split,
      // but assuming standard simple formatting for now since it's a template we provide.
      // Better regex for CSV: /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\s\S][^'\\]*)*)'|"([^"\\]*(?:\\[\s\S][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g
      // For simplicity, we split by comma as an MVP
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      if (!row['razon_social']) continue; // Skip empty rows

      const type = row['tipo_cliente'] === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'BUSINESS';

      newCustomers.push({
        tenantId: tenantUser.tenantId,
        customerType: type,
        businessName: row['razon_social'].substring(0, 100),
        tradeName: row['nombre_fantasia'] || null,
        cuit: row['cuit'] || null,
        email: row['email'] || null,
        phone: row['telefono'] || null,
        address: row['direccion'] || null,
        city: row['ciudad'] || null,
        province: row['provincia'] || null,
        postalCode: row['codigo_postal'] || null,
      });
    }

    if (newCustomers.length === 0) {
      return NextResponse.json({ error: "No se encontraron datos válidos para insertar." }, { status: 400 });
    }

    // Bulk Insert into Prisma
    const result = await prisma.customer.createMany({
      data: newCustomers,
      skipDuplicates: true,
    });

    return NextResponse.json({ 
      success: true, 
      message: `¡Se importaron ${result.count} clientes exitosamente!` 
    }, { status: 201 });

  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Error integrando datos del CSV.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
