import { Tag, Plus } from 'lucide-react';
import Link from 'next/link';

export default function PricesPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Motor de Precios</h1>
          <p className="page-subtitle">Reglas de precios por cliente, categoría y producto</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          Nueva Regla de Precio
        </button>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Tag size={20} style={{ color: 'var(--color-primary-light)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              Cómo funciona el motor de precios
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Las reglas se aplican por prioridad: <strong style={{ color: 'var(--text-secondary)' }}>Precio Cliente</strong> {'>'}{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>Precio Categoría</strong> {'>'}{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>Precio Lista General</strong>.
              Podés definir precios fijos, descuentos porcentuales o markups para cada combinación.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="empty-state">
          <div className="empty-state-icon">
            <Tag size={28} />
          </div>
          <h3 className="empty-state-title">Sin reglas de precio</h3>
          <p className="empty-state-desc">
            Definí reglas de precios preferenciales por cliente o categoría para automatizar la facturación.
          </p>
          <button className="btn btn-primary">
            <Plus size={18} />
            Crear Regla
          </button>
        </div>
      </div>
    </div>
  );
}
