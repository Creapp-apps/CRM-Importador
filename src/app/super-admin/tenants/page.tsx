import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Building2 } from 'lucide-react';

const planColors: Record<string, string> = {
  STARTER: '#71717a',
  PROFESSIONAL: '#8b5cf6',
  ENTERPRISE: '#f59e0b',
};

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { users: true, products: true, customers: true, orders: true } },
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Importadoras
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {tenants.length} empresa{tenants.length !== 1 ? 's' : ''} registrada{tenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/super-admin/tenants/new" className="btn btn-primary" style={{ gap: '8px' }}>
          <Plus size={18} />
          Nueva Importadora
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="card empty-state">
          <Building2 size={40} style={{ color: 'var(--text-muted)' }} />
          <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '14px' }}>No hay importadoras registradas todavía</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Empresa', 'Contacto', 'Plan', 'Usuarios', 'Pedidos', 'Estado', 'Acciones'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>{tenant.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{tenant.slug}</div>
                  </td>
                  <td>
                    {tenant.email && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{tenant.email}</div>}
                    {tenant.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tenant.phone}</div>}
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
                  <td style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {tenant._count.users}
                  </td>
                  <td style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {tenant._count.orders}
                  </td>
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
                  <td>
                    <Link href={`/super-admin/tenants/${tenant.id}`} style={{
                      fontSize: '13px', color: 'var(--color-primary-light)', textDecoration: 'none',
                    }}>
                      Gestionar →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
