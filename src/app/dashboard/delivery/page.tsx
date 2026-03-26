import { Truck, Plus, MapPin } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { redirect } from 'next/navigation';

export default async function DeliveryRoutesPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const routes = await prisma.deliveryRoute.findMany({
    where: { tenantId: tenantUser.tenantId },
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { scheduledDate: 'desc' },
  });

  const statusColors: Record<string, { bg: string, text: string, label: string }> = {
    PLANNING: { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', label: 'Planificando' },
    LOADING: { bg: 'rgba(249, 115, 22, 0.15)', text: '#f97316', label: 'Cargando' },
    LOADED: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', label: 'Cargado' },
    IN_TRANSIT: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', label: 'En Reparto' },
    COMPLETED: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', label: 'Completada' },
    CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', label: 'Cancelada' },
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Hojas de Ruta</h1>
          <p className="page-subtitle">Gestión de logística, repartos y entregas a clientes</p>
        </div>
        <Link href="/dashboard/delivery/new" className="btn btn-primary">
          <Plus size={18} />
          Nueva Hoja de Ruta
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={24} color="#facc15" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {routes.filter(r => r.status === 'PLANNING').length}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rutas Pendientes</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={24} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {routes.filter(r => r.status === 'IN_TRANSIT').length}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>En Reparto</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={24} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {routes.filter(r => r.status === 'COMPLETED').length}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Completadas</div>
          </div>
        </div>
      </div>

      {routes.length === 0 ? (
        <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ margin: '0 auto 16px', background: 'rgba(139, 92, 246, 0.1)' }}>
            <Truck size={28} style={{ color: '#8b5cf6' }} />
          </div>
          <h3 className="empty-state-title">No hay hojas de ruta</h3>
          <p className="empty-state-desc">Generá hojas de ruta para agrupar pedidos y asignarlos a tus repartidores.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Fecha programada</th>
                <th>Repartidor asignado</th>
                <th>Vehículo</th>
                <th style={{ textAlign: 'center' }}>Paradas (Pedidos)</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => {
                const style = statusColors[route.status] || statusColors.PLANNING;
                
                return (
                  <tr key={route.id}>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--color-primary-light)' }}>
                        {route.routeNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {new Date(route.scheduledDate).toLocaleDateString('es-AR', {
                          weekday: 'long', day: '2-digit', month: 'long'
                        })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {route.driverName || 'Vendedor/Interno'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {route.vehiclePlate || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '13px' }}>
                        {route._count.items} envíos
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                        borderRadius: '999px', background: style.bg, color: style.text,
                      }}>
                        {style.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link href={`/dashboard/delivery/${route.id}`} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
