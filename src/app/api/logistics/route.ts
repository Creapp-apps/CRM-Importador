import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTenantUser } from "@/lib/tenant";

// --- Funciones Matemáticas para Ruteo (TSP Simplificado) ---
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}
// -------------------------------------------------------------

// GET /api/logistics — get all delivery routes for the tenant
export async function GET(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const routes = await prisma.deliveryRoute.findMany({
      where: {
        tenantId: tenantUser.tenantId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { scheduledDate: "desc" },
    });

    return NextResponse.json(routes);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading routes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/logistics — create a new delivery route
export async function POST(req: NextRequest) {
  try {
    const tenantUser = await requireTenantUser();
    const body = await req.json();

    const { date, assignedUserId, vehicleInfo, notes, orderIds } = body;

    if (!date || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "La fecha y al menos un pedido son requeridos" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Validar pedidos
      const orders = await tx.order.findMany({
        where: { id: { in: orderIds }, tenantId: tenantUser.tenantId },
        include: { customer: true }
      });

      if (orders.length !== orderIds.length) {
        throw new Error("Uno o más pedidos no fueron encontrados");
      }

      // Obtener coordenadas de la fábrica de la importadora (Tenant)
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantUser.tenantId },
        select: { logisticBaseLat: true, logisticBaseLng: true }
      });

      // Ruteo Geográfico: Ordenar Pedidos por Vecino Más Cercano (Nearest Neighbor TSP)
      let sortedOrderIds = [...orderIds];

      if (tenant?.logisticBaseLat && tenant?.logisticBaseLng) {
        const baseLat = Number(tenant.logisticBaseLat);
        const baseLng = Number(tenant.logisticBaseLng);

        // Separar pedidos con y sin coordenadas
        const ordersWithCoords = orders.filter(o => o.customer?.latitude && o.customer?.longitude);
        const ordersWithoutCoords = orders.filter(o => !o.customer?.latitude || !o.customer?.longitude);

        const route: string[] = [];
        let currentLat = baseLat;
        let currentLng = baseLng;
        const unvisited = [...ordersWithCoords];

        // Vecino más cercano iterativo
        while(unvisited.length > 0) {
          let nearestIdx = 0;
          let minDistance = Infinity;

          for (let i = 0; i < unvisited.length; i++) {
            const o = unvisited[i];
            const dist = getDistanceInKm(currentLat, currentLng, Number(o.customer!.latitude), Number(o.customer!.longitude));
            if (dist < minDistance) {
              minDistance = dist;
              nearestIdx = i;
            }
          }

          const nearestOrder = unvisited[nearestIdx];
          route.push(nearestOrder.id);
          currentLat = Number(nearestOrder.customer!.latitude);
          currentLng = Number(nearestOrder.customer!.longitude);
          unvisited.splice(nearestIdx, 1); // Remover el visitado
        }

        // Agregar los pedidos sin coordenadas al final de la ruta
        const withoutCoordsIds = ordersWithoutCoords.map(o => o.id);
        sortedOrderIds = [...route, ...withoutCoordsIds];
      }

      // Route number generation
      const routeCount = await tx.deliveryRoute.count({ where: { tenantId: tenantUser.tenantId } });
      const routeNumber = `HR-${(routeCount + 1).toString().padStart(5, '0')}`;

      // Resolve driver name if assigned
      let driverName = "No asignado";
      if (assignedUserId) {
        const driver = await tx.user.findUnique({ where: { id: assignedUserId } });
        if (driver) driverName = driver.name;
      }

      // 2. Create Route
      const route = await tx.deliveryRoute.create({
        data: {
          tenantId: tenantUser.tenantId,
          routeNumber,
          scheduledDate: new Date(date),
          status: "PLANNING",
          driverId: assignedUserId || null,
          driverName: driverName,
          vehiclePlate: vehicleInfo || null,
          notes: notes || null,
          // 3. Create route-order links (DeliveryRouteItem)
          items: {
            create: sortedOrderIds.map((orderId: string, index: number) => ({
              orderId,
              sequence: index + 1,
              status: "PENDING",
            })),
          },
        },
      });

      // 4. Update order statuses to IN_DELIVERY
      await tx.order.updateMany({
        where: { id: { in: orderIds }, tenantId: tenantUser.tenantId },
        data: { status: "IN_DELIVERY" },
      });

      return route;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error creating route";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
