import { Package, Users, ShoppingCart, Truck, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general del negocio</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card" style={{ '--stat-color': '#6366f1', '--stat-color-faint': 'rgba(99, 102, 241, 0.1)' } as React.CSSProperties}>
          <div className="stat-card-icon">
            <Package size={22} />
          </div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-label">Productos Activos</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#06b6d4', '--stat-color-faint': 'rgba(6, 182, 212, 0.1)' } as React.CSSProperties}>
          <div className="stat-card-icon">
            <Users size={22} />
          </div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-label">Clientes Registrados</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#10b981', '--stat-color-faint': 'rgba(16, 185, 129, 0.1)' } as React.CSSProperties}>
          <div className="stat-card-icon">
            <ShoppingCart size={22} />
          </div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-label">Pedidos del Mes</div>
        </div>

        <div className="stat-card" style={{ '--stat-color': '#f59e0b', '--stat-color-faint': 'rgba(245, 158, 11, 0.1)' } as React.CSSProperties}>
          <div className="stat-card-icon">
            <Truck size={22} />
          </div>
          <div className="stat-card-value">0</div>
          <div className="stat-card-label">Repartos Activos</div>
        </div>
      </div>

      {/* Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Últimos Pedidos</h2>
              <p className="card-subtitle">Actividad reciente</p>
            </div>
          </div>
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon">
              <ShoppingCart size={28} />
            </div>
            <h3 className="empty-state-title">Sin pedidos aún</h3>
            <p className="empty-state-desc">
              Los pedidos aparecerán aquí a medida que se carguen en el sistema.
            </p>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Alertas de Stock</h2>
              <p className="card-subtitle">Productos con stock bajo</p>
            </div>
          </div>
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
              <AlertTriangle size={28} style={{ color: '#fbbf24' }} />
            </div>
            <h3 className="empty-state-title">Todo en orden</h3>
            <p className="empty-state-desc">
              No hay productos con stock por debajo del mínimo configurado.
            </p>
          </div>
        </div>
      </div>

      {/* Revenue & Performance Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Revenue Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Facturación del Mes</h2>
              <p className="card-subtitle">Resumen financiero</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <DollarSign size={16} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Ventas</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>$0</div>
              <div className="stat-card-change" style={{ color: 'var(--color-success)' }}>
                <TrendingUp size={14} /> --
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <DollarSign size={16} style={{ color: 'var(--color-warning)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cobrado</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>$0</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <DollarSign size={16} style={{ color: 'var(--color-danger)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pendiente</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>$0</div>
            </div>
          </div>
        </div>

        {/* Top Clients */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Top Clientes</h2>
              <p className="card-subtitle">Mayor facturación</p>
            </div>
          </div>
          <div className="empty-state" style={{ padding: '24px 16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Sin datos suficientes aún
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
