import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { redirect } from 'next/navigation';
import { ShoppingCart, Users, Package, TrendingUp, Truck, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    productsCount,
    customersCount,
    ordersCount,
    pendingRoutesCount,
    recentOrders,
    completedRoutesMonth,
    monthlyOrders,
    allProducts
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
    }),
    prisma.deliveryRoute.count({
      where: { 
        tenantId: tenantUser.tenantId, 
        status: 'COMPLETED',
        completedAt: { gte: startOfMonth }
      }
    }),
    prisma.order.findMany({
      where: {
        tenantId: tenantUser.tenantId,
        createdAt: { gte: startOfMonth },
        status: { in: ['CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'INVOICED'] }
      },
      select: { total: true }
    }),
    prisma.product.findMany({
      where: { tenantId: tenantUser.tenantId, isActive: true },
      select: { id: true, name: true, currentStock: true, minimumStock: true }
    })
  ]);

  // Calculate Monthly Revenue
  const monthlyRevenue = monthlyOrders.reduce((acc, order) => acc + Number(order.total), 0);

  // Calculate Low Stock alerts
  const lowStockProducts = allProducts.filter(p => Number(p.currentStock) <= Number(p.minimumStock) && Number(p.minimumStock) > 0).slice(0, 5);

  const stats = [
    { label: 'Ingresos del mes', value: `$${monthlyRevenue.toLocaleString('es-AR')}`, icon: TrendingUp, color: '#10b981', href: '/dashboard/orders' },
    { label: 'Rutas Completadas (Mes)', value: completedRoutesMonth, icon: CheckCircle2, color: '#0ea5e9', href: '/dashboard/delivery' },
    { label: 'Productos Activos', value: productsCount, icon: Package, color: '#8b5cf6', href: '/dashboard/products' },
    { label: 'Clientes Registrados', value: customersCount, icon: Users, color: '#f59e0b', href: '/dashboard/customers' },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Hola, {tenantUser.user.name.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Este es el resumen operativo y comercial de {tenantUser.tenant?.name || 'tu importadora'}.
          </p>
        </div>
        <div style={{ textAlign: 'right', background: 'var(--bg-surface)', padding: '12px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Mes Actual</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{now.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: '24px' }}>
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', transition: 'all 0.2s', borderColor: `${stat.color}30` }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: `${stat.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <stat.icon size={24} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                {stat.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        
        {/* Left Column: Recent Orders and Low Stock */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '1 1 500px', minWidth: 0 }}>
          
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="card-title">Últimos Pedidos / Ventas</h2>
              <Link href="/dashboard/orders" style={{ fontSize: '13px', color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 500 }}>
                Ver historial completo →
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
              <div className="table-responsive">
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order.id}>
                        <td style={{ fontWeight: 600 }}>
                          <Link href={`/dashboard/orders/${order.id}`} style={{ color: 'var(--color-primary-light)', textDecoration: 'none' }}>
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td>{order.customer.tradeName || order.customer.businessName}</td>
                        <td>
                          <span className="badge badge-secondary" style={{ fontSize: '11px' }}>{order.status}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ${Number(order.total).toLocaleString('es-AR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <AlertCircle size={20} style={{ color: 'var(--color-danger)' }} />
              <h2 className="card-title" style={{ margin: 0 }}>Alertas de Stock ({lowStockProducts.length})</h2>
            </div>
            
            {lowStockProducts.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 500 }}>El stock de tu catálogo está saludable.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lowStockProducts.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-root)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-danger)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mínimo sugerido: {Number(p.minimumStock)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-danger)' }}>{Number(p.currentStock)}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>en stock</div>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/stock" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
                  Realizar Movimiento de Stock
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Quick Actions & Pending routes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: '1 1 300px', minWidth: 0 }}>
          
          <div className="card" style={{ background: 'var(--bg-surface)' }}>
            <div className="card-header">
              <h2 className="card-title">Accesos Rápidos</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/dashboard/orders/new" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <Plus size={18} /> Nuevo Pedido
              </Link>
              <Link href="/dashboard/customers/new" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                <Users size={18} /> Nuevo Cliente
              </Link>
              <Link href="/dashboard/products/new" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                <Package size={18} /> Agregar Producto
              </Link>
              <Link href="/dashboard/delivery/new" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                <Truck size={18} /> Armar Hoja de Ruta
              </Link>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-surface)' }}>
            <div className="card-header">
              <h2 className="card-title">Rutas Pendientes</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #f59e0b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#f59e0b'
              }}>
                {pendingRoutesCount}
              </div>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Tenés hojas de ruta en estado <strong>Planificación</strong> pendientes de asignar vehículo o despachar.
                </p>
                {pendingRoutesCount > 0 && (
                  <Link href="/dashboard/delivery" style={{ display: 'inline-block', marginTop: '8px', fontSize: '13px', color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 500 }}>
                    Ir a Despachos →
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
