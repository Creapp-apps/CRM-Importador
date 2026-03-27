import { FileText, Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function InvoicesPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Facturación</h1>
          <p className="page-subtitle">Facturas, notas de crédito y cuentas corrientes</p>
        </div>
        <Link href="/dashboard/invoices/new" className="btn btn-primary">
          <Plus size={18} />
          Nueva Factura
        </Link>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['Todas', 'Pendiente', 'Emitida', 'Pagada', 'Parcial', 'Anulada'].map((status, i) => (
          <button
            key={status}
            className={`btn btn-sm ${i === 0 ? 'btn-primary' : 'btn-secondary'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="empty-state">
          <div className="empty-state-icon" style={{ background: 'rgba(99, 102, 241, 0.1)' }}>
            <FileText size={28} style={{ color: '#6366f1' }} />
          </div>
          <h3 className="empty-state-title">Sin facturas emitidas</h3>
          <p className="empty-state-desc">
            Las facturas se generarán automáticamente al facturar pedidos entregados.
          </p>
        </div>
      </div>
    </div>
  );
}
