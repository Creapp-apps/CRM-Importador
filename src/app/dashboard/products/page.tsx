import { Package, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
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

      {/* Product Table */}
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
    </div>
  );
}
