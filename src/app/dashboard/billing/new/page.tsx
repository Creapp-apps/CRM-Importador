'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Box } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [receiptType, setReceiptType] = useState('11'); // Default C

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Show only delivered or ready non-invoiced
          setOrders(data.filter(o => 
            !['DRAFT', 'CANCELLED', 'INVOICED'].includes(o.status)
          ));
        }
      })
      .catch(console.error);
  }, []);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder) return;
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          receiptType,
          total: selectedOrder.total,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al emitir factura en AFIP');
      }

      router.push('/dashboard/billing');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error AFIP');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard/billing" className="btn btn-ghost btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">Emitir Facturacón (Simulada)</h1>
          <p className="page-subtitle">Integración AFIP Mocked</p>
        </div>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Parámetros de AFIP</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 2fr) 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Pedido asoaciado *</label>
              <select
                className="input-field"
                value={selectedOrderId}
                onChange={e => setSelectedOrderId(e.target.value)}
                required
              >
                <option value="">Seleccionar pedido listo a facturar...</option>
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customer.tradeName || o.customer.businessName} (${Number(o.total).toLocaleString('es-AR')})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Tipo *</label>
              <select
                className="input-field"
                value={receiptType}
                onChange={e => setReceiptType(e.target.value)}
                required
              >
                <option value="1">Factura A</option>
                <option value="6">Factura B</option>
                <option value="11">Factura C</option>
              </select>
            </div>
          </div>

          {selectedOrder && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '8px', border: '1px dashed rgba(56, 189, 248, 0.4)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cliente a facturar:</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {selectedOrder.customer.businessName} (CUIT: {selectedOrder.customer.cuit || 'No registrado'})
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total del comprobante:</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                 ${Number(selectedOrder.total).toLocaleString('es-AR')}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link href="/dashboard/billing" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading || !selectedOrderId}>
            {loading ? 'Conectando con AFIP...' : 'Generar CAE'}
          </button>
        </div>
      </form>
    </div>
  );
}
