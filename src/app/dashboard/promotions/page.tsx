import { DollarSign, Plus } from 'lucide-react';

export default function PromotionsPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Promociones</h1>
          <p className="page-subtitle">Descuentos por volumen, por cliente y campañas especiales</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Nueva Promoción
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="empty-state">
          <div className="empty-state-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <DollarSign size={28} style={{ color: '#10b981' }} />
          </div>
          <h3 className="empty-state-title">Sin promociones activas</h3>
          <p className="empty-state-desc">
            Creá promociones con descuento por volumen, por categoría de cliente, o campañas por fecha.
          </p>
          <button className="btn btn-primary">
            <Plus size={18} />
            Crear Promoción
          </button>
        </div>
      </div>
    </div>
  );
}
