import { FileText, Plus, Receipt } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) redirect('/login');

  const invoices = await prisma.invoice.findMany({
    where: { tenantId: tenantUser.tenantId },
    include: {
      order: {
        select: { orderNumber: true, customer: { select: { businessName: true, cuit: true } } },
      },
    },
    orderBy: { issuedAt: 'desc' },
  });

  const receiptTypes: Record<number, string> = {
    1: 'Factura A',
    6: 'Factura B',
    11: 'Factura C',
    3: 'Nota de Crédito A',
    8: 'Nota de Crédito B',
    13: 'Nota de Crédito C',
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Facturación AFIP</h1>
          <p className="page-subtitle">Comprobantes emitidos y CAE</p>
        </div>
        <Link href="/dashboard/billing/new" className="btn btn-primary">
          <Plus size={18} />
          Emitir Factura
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="card" style={{ padding: '64px 32px', textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ margin: '0 auto 16px', background: 'rgba(139, 92, 246, 0.1)' }}>
            <FileText size={28} style={{ color: '#8b5cf6' }} />
          </div>
          <h3 className="empty-state-title">Aún no realizaste facturas</h3>
          <p className="empty-state-desc">Facturá pedidos completados con CAE electrónico (AFIP).</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha Emisión</th>
                <th>Comprobante</th>
                <th>Nro. Factura</th>
                <th>Cliente</th>
                <th>CUIT</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th>CAE</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {new Date(inv.issuedAt).toLocaleDateString('es-AR')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-light)' }}>
                      {inv.type || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)' }}>
                      {inv.invoiceNumber || '—'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {inv.order?.customer?.businessName || '—'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {inv.order?.customer?.cuit || '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${Number(inv.total).toLocaleString('es-AR')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {inv.afipCae || '—'}
                      </span>
                      {inv.afipCae && <Receipt size={14} style={{ color: 'var(--color-success)' }} />}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                      borderRadius: '999px',
                      background: inv.status === 'ISSUED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: inv.status === 'ISSUED' ? '#34d399' : '#f87171',
                    }}>
                      {inv.status === 'ISSUED' ? 'Autorizada' : 'Rechazada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
