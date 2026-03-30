import { prisma } from '@/lib/prisma';
import { Building2, Users, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
  const [tenantCount, userCount, activeTenantsCount] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.tenant.count({ where: { isActive: true } }),
  ]);

  const recentTenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      _count: { select: { users: true, products: true, customers: true } },
    },
  });

  const stats = [
    { label: 'Total Importadoras', value: tenantCount, icon: Building2, color: '#8b5cf6' },
    { label: 'Usuarios Totales', value: userCount, icon: Users, color: '#06b6d4' },
    { label: 'Activas', value: activeTenantsCount, icon: TrendingUp, color: '#10b981' },
    { label: 'Ingresos MRR', value: '$0', icon: DollarSign, color: '#f59e0b' },
  ];

  const planColors: Record<string, string> = {
    STARTER: '#71717a',
    PROFESSIONAL: '#8b5cf6',
    ENTERPRISE: '#f59e0b',
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Panel de Administración
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Gestión de todas las importadoras en la plataforma CreAPP
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px',
              background: `${stat.color}15`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Tenants */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Importadoras Recientes
          </h2>
          <Link href="/super-admin/tenants" style={{
            fontSize: '13px', color: 'var(--color-primary-light)', textDecoration: 'none',
          }}>
            Ver todas →
          </Link>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              {['Empresa', 'CUIT', 'Plan', 'Usuarios', 'Productos', 'Clientes', 'Estado'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentTenants.map((tenant) => (
              <tr key={tenant.id}>
                <td>
                  <Link href={`/super-admin/tenants/${tenant.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>{tenant.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tenant.slug}</div>
                  </Link>
                </td>
                <td style={{ fontFamily: 'monospace' }}>
                  {tenant.cuit || '—'}
                </td>
                <td>
                  <span style={{
                    fontSize: '12px', fontWeight: 500, padding: '3px 10px',
                    borderRadius: '999px',
                    background: `${planColors[tenant.plan]}15`,
                    color: planColors[tenant.plan],
                  }}>
                    {tenant.plan}
                  </span>
                </td>
                <td>{tenant._count.users}</td>
                <td>{tenant._count.products}</td>
                <td>{tenant._count.customers}</td>
                <td>
                  <span style={{
                    fontSize: '12px', fontWeight: 500, padding: '3px 10px',
                    borderRadius: '999px',
                    background: tenant.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: tenant.isActive ? '#34d399' : '#f87171',
                  }}>
                    {tenant.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
