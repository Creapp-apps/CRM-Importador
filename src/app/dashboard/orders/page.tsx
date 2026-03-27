import { ShoppingCart, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { redirect } from 'next/navigation';

export default async function OrdersPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const orders = await prisma.order.findMany({
    where: { tenantId: tenantUser.tenantId },
    include: {
      customer: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const statusColors: Record<string, { bg: string, text: string, label: string }> = {
    DRAFT: { bg: 'rgba(113, 113, 122, 0.15)', text: '#a1a1aa', label: 'Borrador' },
    CONFIRMED: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', label: 'Confirmado' },
    PREPARING: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', label: 'En Preparación' },
    READY: { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', label: 'Listo' },
    IN_DELIVERY: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fb923c', label: 'En Reparto' },
    DELIVERED: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', label: 'Entregado' },
    INVOICED: { bg: 'rgba(6, 182, 212, 0.15)', text: '#22d3ee', label: 'Facturado' },
    CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', label: 'Cancelado' },
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">Gestión de ventas, remitos y estados de entrega</p>
        </div>
        <Link href="/dashboard/orders/new" className="btn btn-primary">
          <Plus size={18} />
          Nuevo Pedido
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por cliente, nro de pedido..."
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
              <ShoppingCart size={28} style={{ color: '#8b5cf6' }} />
            </div>
            <h3 className="empty-state-title">Sin pedidos aún</h3>
            <p className="empty-state-desc">
              Creá tu primer pedido de venta asociando un cliente y productos del inventario.
            </p>
            <Link href="/dashboard/orders/new" className="btn btn-primary">
              <Plus size={18} />
              Crear Pedido
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nro. Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Canal</th>
                <th style={{ textAlign: 'center' }}>Items</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>Estado</th>
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const sColor = statusColors[order.status] || statusColors.DRAFT;
                return (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/dashboard/orders/${order.id}`} style={{ fontWeight: 600, color: 'var(--color-primary-light)', textDecoration: 'none' }}>
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {new Date(order.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {order.customer.tradeName || order.customer.businessName}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {order.customer.salesChannel || 'Directo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '12px' }}>
                        {order._count.items}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        ${Number(order.total).toLocaleString('es-AR')}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                        borderRadius: '999px', background: sColor.bg, color: sColor.text,
                        whiteSpace: 'nowrap',
                      }}>
                        {sColor.label}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {order.createdByName}
                      </span>
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
