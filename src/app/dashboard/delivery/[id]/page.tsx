import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import Link from 'next/link';
import { ArrowLeft, MapPin, Truck, Calendar, User, AlignLeft } from 'lucide-react';
import RouteMap from '@/components/maps/RouteMapWrapper';

export default async function DeliveryRouteDetailPage({ params }: { params: { id: string } }) {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const route = await prisma.deliveryRoute.findUnique({
    where: {
      id: params.id,
      tenantId: tenantUser.tenantId,
    },
    include: {
      items: {
        orderBy: { sequence: 'asc' },
        include: {
          order: {
            include: {
              customer: true,
              items: {
                include: { product: true }
              }
            }
          }
        }
      }
    }
  });

  if (!route) return notFound();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantUser.tenantId },
    select: { logisticBaseLat: true, logisticBaseLng: true }
  });

  // Preparar paradas para el mapa
  const stops = route.items.map(item => ({
    lat: item.order.customer?.latitude ? Number(item.order.customer.latitude) : 0,
    lng: item.order.customer?.longitude ? Number(item.order.customer.longitude) : 0,
    name: item.order.customer?.businessName || item.order.customer?.contactName || 'Cliente',
    sequence: item.sequence,
    address: item.order.customer?.address || 'Sin dirección',
  })).filter(s => s.lat !== 0 && s.lng !== 0);

  const statusColors: Record<string, { bg: string, text: string, label: string }> = {
    PLANNING: { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', label: 'Planificando' },
    LOADING: { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', label: 'Cargando' },
    LOADED: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', label: 'Cargado' },
    IN_TRANSIT: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', label: 'En Reparto' },
    COMPLETED: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', label: 'Completada' },
    CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Cancelada' },
  };

  const style = statusColors[route.status] || statusColors.PLANNING;

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/delivery" className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">{route.routeNumber}</h1>
            <p className="page-subtitle">Hoja de Ruta y Entregas</p>
          </div>
        </div>
        <span style={{
          fontSize: '13px', fontWeight: 600, padding: '6px 16px',
          borderRadius: '999px', background: style.bg, color: style.text,
        }}>
          ESTADO: {style.label.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Info Card */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Detalles de Logística</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <Calendar size={18} />
                <span><strong style={{ color: 'var(--text-primary)' }}>Fecha:</strong> {new Date(route.scheduledDate).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <User size={18} />
                <span><strong style={{ color: 'var(--text-primary)' }}>Repartidor:</strong> {route.driverName || 'No asignado'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                <Truck size={18} />
                <span><strong style={{ color: 'var(--text-primary)' }}>Vehículo:</strong> {route.vehiclePlate || '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px', color: 'var(--text-secondary)' }}>
                <AlignLeft size={18} style={{ marginTop: '2px' }} />
                <span><strong style={{ color: 'var(--text-primary)' }}>Notas:</strong> {route.notes || 'Sin observaciones'}</span>
              </div>
            </div>
          </div>

          {/* Map Card */}
          <div className="card" style={{ padding: '4px' }}>
            <RouteMap 
              baseLat={tenant?.logisticBaseLat ? Number(tenant.logisticBaseLat) : null}
              baseLng={tenant?.logisticBaseLng ? Number(tenant.logisticBaseLng) : null}
              stops={stops}
            />
          </div>

        </div>

        {/* Stops Timeline */}
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} className="text-primary" />
            Recorrido Programado
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {route.items.map((item, index) => {
              const customer = item.order.customer;
              const hasCoords = customer?.latitude && customer?.longitude;
              
              return (
                <div key={item.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', left: '15px', top: '32px', bottom: '-16px', 
                    width: '2px', background: index === route.items.length - 1 ? 'transparent' : 'var(--border-color)',
                    zIndex: 0
                  }} />
                  
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', 
                    border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', zIndex: 1
                  }}>
                    {item.sequence}
                  </div>
                  
                  <div style={{ 
                    flex: 1, border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px',
                    background: 'var(--bg-card)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <Link href={`/dashboard/orders/${item.orderId}`} style={{ fontWeight: 600, color: 'var(--color-primary-light)', textDecoration: 'none', fontSize: '15px' }}>
                          Pedido #{item.order.orderNumber.split('-')[1]}
                        </Link>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {customer?.businessName || customer?.contactName || 'Cliente'}
                        </h4>
                      </div>
                      <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                        {item.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} color={hasCoords ? 'var(--color-primary-light)' : 'var(--text-muted)'} />
                      {customer?.address || 'Sin dirección'}
                      {customer?.city ? `, ${customer.city}` : ''}
                      {!hasCoords && <span style={{ color: 'var(--color-warning)', marginLeft: '8px', fontSize: '12px' }}>(Sin ubicación exacta en mapa)</span>}
                    </p>

                    <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                       <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>RESUMEN DE CARGA:</p>
                       <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                         {item.order.items.map(oi => (
                           <li key={oi.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-primary)' }}>
                             <span>{oi.quantity}x {oi.product.name}</span>
                           </li>
                         ))}
                       </ul>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
