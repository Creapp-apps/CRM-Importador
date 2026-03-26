import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';

export async function PUT(request: Request) {
  try {
    const tenantUser = await getCurrentTenantUser();
    if (!tenantUser || tenantUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const json = await request.json();
    const { logisticBaseAddress, logisticBaseLat, logisticBaseLng } = json;

    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantUser.tenantId },
      data: {
        logisticBaseAddress: logisticBaseAddress || null,
        logisticBaseLat: logisticBaseLat ? Number(logisticBaseLat) : null,
        logisticBaseLng: logisticBaseLng ? Number(logisticBaseLng) : null,
      },
    });

    return NextResponse.json(updatedTenant);
  } catch (error: any) {
    console.error('Error updating tenant settings:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
