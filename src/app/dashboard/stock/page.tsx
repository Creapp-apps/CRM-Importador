import { BarChart3, Search, Filter, Download } from 'lucide-react';

export default function StockPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Control de Stock</h1>
          <p className="page-subtitle">Ajustes manuales, historial y auditoría de movimientos</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary">
            <Download size={16} />
            Exportar PDF
          </button>
          <button className="btn btn-primary">
            Ajuste Manual
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar producto para ver stock..."
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={16} />
            Filtros
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="empty-state">
          <div className="empty-state-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <BarChart3 size={28} style={{ color: '#3b82f6' }} />
          </div>
          <h3 className="empty-state-title">Sin movimientos de stock</h3>
          <p className="empty-state-desc">
            Cargá productos para empezar a gestionar el inventario y sus movimientos.
          </p>
        </div>
      </div>
    </div>
  );
}
