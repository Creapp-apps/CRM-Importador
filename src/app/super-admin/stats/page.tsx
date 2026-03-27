import { prisma } from '@/lib/prisma';
import { BarChart3, TrendingUp, Users, ArrowUpRight } from 'lucide-react';

export default async function SuperAdminStatsPage() {
  const [
    totalTenants,
    totalUsers,
    totalOrders,
    recentTenants
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.tenant.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) // Last 30 days
        }
      }
    })
  ]);

  // Simulated metrics for MVP
  const mrr = totalTenants * 15000; // Estimated $15.000 ARS per tenant
  const growthRate = recentTenants.length > 0 ? `+${recentTenants.length}` : '0';

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.3px' }}>
          Estadísticas Globales
        </h1>
        <p style={{ fontSize: '14px', color: '#71717a', marginTop: '4px' }}>
          Métricas de uso y crecimiento de la plataforma CreAPP
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {/* MRR Card */}
        <div style={{
          background: '#0f0f14', border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.05 }}>
            <TrendingUp size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#c4b5fd" />
            </div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: 500 }}>MRR Estimado</div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#fafafa', letterSpacing: '-1px' }}>
            ${mrr.toLocaleString('es-AR')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '13px', color: '#34d399' }}>
            <ArrowUpRight size={16} />
            <span>12% respecto al mes anterior</span>
          </div>
        </div>

        {/* Growth Card */}
        <div style={{
          background: '#0f0f14', border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} color="#7dd3fc" />
            </div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: 500 }}>Importadoras Totales</div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#fafafa', letterSpacing: '-1px' }}>
            {totalTenants}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '13px', color: '#71717a' }}>
            <span style={{ color: '#38bdf8' }}>{growthRate}</span> nuevas este mes
          </div>
        </div>

        {/* Usage Card */}
        <div style={{
          background: '#0f0f14', border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#6ee7b7" />
            </div>
            <div style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: 500 }}>Usuarios & Actividad</div>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#fafafa', letterSpacing: '-1px' }}>
            {totalUsers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '13px', color: '#71717a' }}>
            {totalOrders.toLocaleString('es-AR')} órdenes procesadas históricas
          </div>
        </div>
      </div>

      {/* Fake Chart Area for MVP */}
      <div style={{
        background: '#0f0f14', border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px', padding: '24px'
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa', marginBottom: '24px' }}>
          Volumen Transaccional Global (Últimos 12 meses)
        </h2>
        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingTop: '20px' }}>
          {/* Mock bars */}
          {[40, 55, 45, 60, 75, 65, 80, 70, 85, 95, 85, 100].map((height, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '100%', height: `${height}%`, background: i === 11 ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)', 
                borderRadius: '6px 6px 0 0', transition: 'all 0.3s' 
              }}></div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>Mes {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
