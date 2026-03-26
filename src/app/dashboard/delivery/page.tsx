import { Truck, Plus, Search, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function DeliveryPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Repartos</h1>
          <p className="page-subtitle">Hojas de ruta, carga de vehículos y seguimiento de entregas</p>
        </div>
        <Link href="/dashboard/delivery/new" className="btn btn-primary">
          <Plus size={18} />
          Nueva Hoja de Ruta
        </Link>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['Todos', 'Planificando', 'Cargando', 'En Tránsito', 'Completado'].map((status, i) => (
          <button
            key={status}
            className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Routes Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="empty-state">
          <div className="empty-state-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <Truck size={28} style={{ color: '#f59e0b' }} />
          </div>
          <h3 className="empty-state-title">Sin hojas de ruta</h3>
          <p className="empty-state-desc">
            Creá una nueva hoja de ruta asignando pedidos confirmados a un vehículo y repartidor.
          </p>
          <Link href="/dashboard/delivery/new" className="btn btn-primary">
            <Plus size={18} />
            Crear Hoja de Ruta
          </Link>
        </div>
      </div>
    </div>
  );
}
