import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantUser = await requireTenantUser();

    if (tenantUser.role !== 'ADMIN') {
      return NextResponse.json({ error: "Only admins can delete UoMs" }, { status: 403 });
    }

    // Comprobar si está en uso por algún producto
    const inUse = await prisma.product.findFirst({
      where: { tenantId: tenantUser.tenantId, baseUnitId: id }
    });

    if (inUse) {
      return NextResponse.json(
        { error: "No se puede eliminar esta unidad de medida porque está siendo usada por uno o más productos." },
        { status: 400 }
      );
    }

    await prisma.unitOfMeasure.delete({
      where: {
        id,
        tenantId: tenantUser.tenantId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting unit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
