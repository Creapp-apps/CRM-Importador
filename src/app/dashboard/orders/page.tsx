import { ShoppingCart, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <p className="page-subtitle">Carga y gestión de pedidos</p>
        </div>
        <Link href="/dashboard/orders/new" className="btn btn-primary">
          <Plus size={18} />
          Nuevo Pedido
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['Todos', 'Borrador', 'Confirmado', 'Preparando', 'Listo', 'En Reparto', 'Entregado'].map((status, i) => (
          <button
            key={status}
            className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="empty-state">
          <div className="empty-state-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <ShoppingCart size={28} style={{ color: '#10b981' }} />
          </div>
          <h3 className="empty-state-title">Sin pedidos cargados</h3>
          <p className="empty-state-desc">
            Creá un nuevo pedido seleccionando un cliente y sus productos.
          </p>
          <Link href="/dashboard/orders/new" className="btn btn-primary">
            <Plus size={18} />
            Crear Pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
