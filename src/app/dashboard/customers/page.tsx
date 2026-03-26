import { Users, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function CustomersPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">CRM — Gestión de clientes, categorías y cuentas corrientes</p>
        </div>
        <Link href="/dashboard/customers/new" className="btn btn-primary">
          <Plus size={18} />
          Nuevo Cliente
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

      {/* Customers Table */}
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
    </div>
  );
}
