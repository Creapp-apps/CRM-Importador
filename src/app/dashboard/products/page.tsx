import { Package, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { redirect } from 'next/navigation';

export default async function ProductsPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const products = await prisma.product.findMany({
    where: { tenantId: tenantUser.tenantId },
    include: {
      baseUnit: true,
      presentations: {
        where: { isActive: true },
        orderBy: { isDefault: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Productos</h1>
          <p className="page-subtitle">Gestión de productos, presentaciones y SKUs</p>
        </div>
        <Link href="/dashboard/products/new" className="btn btn-primary">
          <Plus size={18} />
          Nuevo Producto
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
              placeholder="Buscar por nombre, SKU o marca..."
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="empty-state">
            <div className="empty-state-icon">
              <Package size={28} />
            </div>
            <h3 className="empty-state-title">Sin productos cargados</h3>
            <p className="empty-state-desc">
              Comenzá agregando tu primer producto con sus presentaciones y unidades de medida.
            </p>
            <Link href="/dashboard/products/new" className="btn btn-primary">
              <Plus size={18} />
              Agregar Producto
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th>Unidad Base</th>
                <th style={{ textAlign: 'right' }}>Stock</th>
                <th>Presentaciones</th>
                <th>Estado</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const stockLow = Number(product.currentStock) <= Number(product.minimumStock) && Number(product.minimumStock) > 0;
                return (
                  <tr key={product.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {product.sku}
                      </span>
                    </td>
                    <td>
                      <Link href={`/dashboard/products/${product.id}/edit`} style={{ fontWeight: 500, color: 'var(--color-primary-light)', textDecoration: 'none' }}>
                        {product.name}
                      </Link>
                      {product.description && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {product.description.substring(0, 50)}
                        </div>
                      )}
                    </td>
                    <td>{product.brand || '—'}</td>
                    <td>{product.category || '—'}</td>
                    <td>
                      <span className="badge badge-info">{product.baseUnit.symbol}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        fontWeight: 600,
                        color: stockLow ? 'var(--color-warning)' : 'var(--text-primary)',
                      }}>
                        {Number(product.currentStock).toLocaleString('es-AR')}
                      </span>
                      {stockLow && (
                        <div style={{ fontSize: '11px', color: 'var(--color-warning)' }}>
                          Mín: {Number(product.minimumStock).toLocaleString('es-AR')}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {product.presentations.map(pres => (
                          <span key={pres.id} className="badge badge-primary" style={{ fontSize: '11px' }}>
                            {pres.shortName || pres.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Link href={`/dashboard/products/${product.id}/edit`} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', fontSize: '12px' }}>
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
