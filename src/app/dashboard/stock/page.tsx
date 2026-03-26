import { ArrowLeft, Box, Plus } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { redirect } from 'next/navigation';

export default async function StockHistoryPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const movements = await prisma.stockMovement.findMany({
    where: { tenantId: tenantUser.tenantId },
    include: {
      product: {
        select: { name: true, sku: true, baseUnit: { select: { symbol: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit to last 100 movements
  });

  const typeStyles: Record<string, { bg: string, text: string, label: string }> = {
    IN: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', label: 'Entrada' },
    OUT: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', label: 'Salida' },
    ADJUSTMENT: { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', label: 'Ajuste' },
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Movimientos de Stock</h1>
          <p className="page-subtitle">Historial de entradas, salidas y ajustes manuales</p>
        </div>
        <Link href="/dashboard/stock/new" className="btn btn-primary">
          <Plus size={18} />
          Nuevo Ajuste Manual
        </Link>
      </div>

      {movements.length === 0 ? (
        <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ margin: '0 auto 16px', background: 'rgba(139, 92, 246, 0.1)' }}>
            <Box size={28} style={{ color: '#8b5cf6' }} />
          </div>
          <h3 className="empty-state-title">No hay movimientos</h3>
          <p className="empty-state-desc">Aún no se registraron modificaciones de stock manuales u órdenes.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th style={{ textAlign: 'right' }}>Cant.</th>
                <th>Motivo / Ref</th>
                <th>Usuario responsable</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => {
                const style = typeStyles[mov.type] || typeStyles.ADJUSTMENT;
                const isPositive = mov.type !== 'OUT' && Number(mov.quantity) > 0;
                
                return (
                  <tr key={mov.id}>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {new Date(mov.createdAt).toLocaleString('es-AR', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {mov.product.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        SKU: {mov.product.sku}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                        borderRadius: '999px', background: style.bg, color: style.text,
                      }}>
                        {style.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{
                        fontWeight: 600,
                        color: isPositive ? 'var(--color-success)' : 'var(--color-danger)'
                      }}>
                        {isPositive && mov.type !== 'ADJUSTMENT' ? '+' : ''}
                        {Number(mov.quantity).toLocaleString('es-AR')} {mov.product.baseUnit?.symbol}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {mov.reason || (mov.referenceType === 'ORDER' ? `Pedido #${mov.referenceId}` : '—')}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {mov.createdByName}
                      </span>
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
