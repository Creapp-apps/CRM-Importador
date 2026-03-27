import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { redirect } from 'next/navigation';
import { ShoppingCart, Users, Package, TrendingUp, Truck, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const [
    productsCount,
    customersCount,
    ordersCount,
    pendingRoutesCount,
    recentOrders
  ] = await Promise.all([
    prisma.product.count({ where: { tenantId: tenantUser.tenantId, isActive: true } }),
    prisma.customer.count({ where: { tenantId: tenantUser.tenantId, isActive: true } }),
    prisma.order.count({ where: { tenantId: tenantUser.tenantId } }),
    prisma.deliveryRoute.count({ where: { tenantId: tenantUser.tenantId, status: 'PLANNING' } }),
    prisma.order.findMany({
      where: { tenantId: tenantUser.tenantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: { select: { tradeName: true, businessName: true } } }
    })
  ]);

  const stats = [
    { label: 'Productos Activos', value: productsCount, icon: Package, color: '#8b5cf6', href: '/dashboard/products' },
    { label: 'Clientes', value: customersCount, icon: Users, color: '#06b6d4', href: '/dashboard/customers' },
    { label: 'Pedidos Históricos', value: ordersCount, icon: ShoppingCart, color: '#10b981', href: '/dashboard/orders' },
    { label: 'Rutas Pendientes', value: pendingRoutesCount, icon: Truck, color: '#f59e0b', href: '/dashboard/delivery' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Hola, {tenantUser.user.name.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Este es el resumen de {tenantUser.tenant?.name || 'tu importadora'} para hoy.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="card" style={{ textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: `${stat.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {stat.value.toLocaleString('es-AR')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {stat.label}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Últimos Pedidos</h2>
            <Link href="/dashboard/orders" style={{ fontSize: '13px', color: 'var(--color-primary-light)', textDecoration: 'none' }}>
              Ver todos →
            </Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
              <ShoppingCart size={24} style={{ color: 'var(--text-muted)' }} />
              <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-muted)' }}>No tenés pedidos recientes</p>
              <Link href="/dashboard/orders/new" className="btn btn-primary btn-sm" style={{ marginTop: '16px' }}>
                <Plus size={16} /> Crear Pedido
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentOrders.map(order => (
                <div key={order.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-root)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <Link href={`/dashboard/orders/${order.id}`} style={{ fontWeight: 600, color: 'var(--color-primary-light)', textDecoration: 'none' }}>
                      {order.orderNumber}
                    </Link>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {order.customer.tradeName || order.customer.businessName}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${Number(order.total).toLocaleString('es-AR')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Accesos Rápidos</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/dashboard/orders/new" className="btn btn-primary" style={{ justifyContent: 'center' }}>
              <Plus size={18} /> Nuevo Pedido
            </Link>
            <Link href="/dashboard/products/new" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              <Plus size={18} /> Agregar Producto
            </Link>
            <Link href="/dashboard/customers/new" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
              <Plus size={18} /> Nuevo Cliente
            </Link>
            <Link href="/dashboard/delivery/new" className="btn btn-secondary" style={{ justifyContent: 'center', marginTop: '16px' }}>
              <Truck size={18} /> Armar Reparto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
