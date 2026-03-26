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
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.3px' }}>
            Importadoras
          </h1>
          <p style={{ fontSize: '14px', color: '#71717a', marginTop: '4px' }}>
            {tenants.length} empresa{tenants.length !== 1 ? 's' : ''} registrada{tenants.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/super-admin/tenants/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', background: '#8b5cf6', color: 'white',
          borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
        }}>
          <Plus size={18} />
          Nueva Importadora
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div style={{
          background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', padding: '64px 32px', textAlign: 'center',
        }}>
          <Building2 size={40} style={{ color: '#3f3f46', margin: '0 auto 16px' }} />
          <p style={{ color: '#71717a', fontSize: '14px' }}>No hay importadoras registradas todavía</p>
        </div>
      ) : (
        <div style={{
          background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Empresa', 'Contacto', 'Plan', 'Usuarios', 'Pedidos', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: '11px', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    color: '#71717a',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#fafafa', fontSize: '14px' }}>{tenant.name}</div>
                    <div style={{ fontSize: '12px', color: '#71717a' }}>/{tenant.slug}</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {tenant.email && <div style={{ fontSize: '13px', color: '#a1a1aa' }}>{tenant.email}</div>}
                    {tenant.phone && <div style={{ fontSize: '12px', color: '#71717a' }}>{tenant.phone}</div>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 500, padding: '3px 10px',
                      borderRadius: '999px',
                      background: `${planColors[tenant.plan]}15`,
                      color: planColors[tenant.plan],
                    }}>
                      {tenant.plan}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#a1a1aa' }}>
                    {tenant._count.users}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '14px', color: '#a1a1aa' }}>
                    {tenant._count.orders}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 500, padding: '3px 10px',
                      borderRadius: '999px',
                      background: tenant.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: tenant.isActive ? '#34d399' : '#f87171',
                    }}>
                      {tenant.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/super-admin/tenants/${tenant.id}`} style={{
                      fontSize: '13px', color: '#8b5cf6', textDecoration: 'none',
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
