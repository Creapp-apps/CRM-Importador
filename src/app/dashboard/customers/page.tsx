import { Users, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { redirect } from 'next/navigation';

import ImportExportButtons from './import-export-buttons';

export default async function CustomersPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const customers = await prisma.customer.findMany({
    where: { tenantId: tenantUser.tenantId },
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">CRM — Gestión de clientes, categorías y cuentas corrientes</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <ImportExportButtons />
          <Link href="/dashboard/customers/new" className="btn btn-primary">
            <Plus size={16} />
            <span className="hide-on-mobile">Nuevo Cliente</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por razón social, CUIT o nombre..."
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
              <Users size={28} style={{ color: '#06b6d4' }} />
            </div>
            <h3 className="empty-state-title">Sin clientes registrados</h3>
            <p className="empty-state-desc">
              Agregá tu primer cliente con sus datos comerciales, categoría y condiciones de precio.
            </p>
            <Link href="/dashboard/customers/new" className="btn btn-primary">
              <Plus size={18} />
              Agregar Cliente
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>CUIT</th>
                <th>Contacto</th>
                <th>Ubicación</th>
                <th>Categoría</th>
                <th>Canal</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => {
                const channelLabels: Record<string, string> = {
                  DIRECT: 'Directo',
                  DISTRIBUTOR: 'Distribuidor',
                  ECOMMERCE: 'E-Commerce',
                  WHOLESALE: 'Mayorista',
                };
                const balance = Number(customer.currentBalance);
                return (
                  <tr key={customer.id}>
                    <td>
                      <Link href={`/dashboard/customers/${customer.id}/edit`} style={{ fontWeight: 500, color: 'var(--color-primary-light)', textDecoration: 'none' }}>
                        {customer.tradeName || customer.businessName}
                      </Link>
                      {customer.tradeName && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {customer.businessName}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {customer.cuit || '—'}
                      </span>
                    </td>
                    <td>
                      {customer.email && (
                        <div style={{ fontSize: '13px' }}>{customer.email}</div>
                      )}
                      {customer.phone && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{customer.phone}</div>
                      )}
                      {!customer.email && !customer.phone && '—'}
                    </td>
                    <td>
                      {customer.city || customer.province ? (
                        <div style={{ fontSize: '13px' }}>
                          {[customer.city, customer.province].filter(Boolean).join(', ')}
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      {customer.category ? (
                        <span
                          className="badge"
                          style={{
                            background: customer.category.color ? `${customer.category.color}20` : 'var(--color-primary-faint)',
                            color: customer.category.color || 'var(--color-primary-light)',
                          }}
                        >
                          {customer.category.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      {customer.salesChannel ? channelLabels[customer.salesChannel] || customer.salesChannel : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        fontWeight: 600,
                        color: balance < 0 ? 'var(--color-danger)' : balance > 0 ? 'var(--color-success)' : 'var(--text-secondary)',
                      }}>
                        ${Math.abs(balance).toLocaleString('es-AR')}
                      </span>
                      {balance < 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--color-danger)' }}>Deuda</div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${customer.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {customer.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link href={`/dashboard/customers/${customer.id}/edit`} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Editar
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
