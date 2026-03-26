'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  sku: string;
  name: string;
  currentStock: string;
  baseUnit?: { symbol: string };
}

export default function NewStockMovementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState({
    productId: '',
    type: 'IN', // IN, OUT, ADJUSTMENT
    quantity: '',
    reason: '',
  });

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(console.error);
  }, []);

  const selectedProduct = products.find(p => p.id === form.productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          quantity: Number(form.quantity),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al procesar movimiento');
      }

      router.push('/dashboard/stock');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar movimiento');
    } finally {
      setLoading(false);
    }
  }

  // Preview the new stock
  let newStockPreview = null;
  if (selectedProduct && form.quantity) {
    const current = Number(selectedProduct.currentStock);
    const qty = Number(form.quantity);
    if (form.type === 'IN') newStockPreview = current + qty;
    if (form.type === 'OUT') newStockPreview = current - qty;
    if (form.type === 'ADJUSTMENT') newStockPreview = qty;
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard/stock" className="btn btn-ghost btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">Nuevo Movimiento</h1>
          <p className="page-subtitle">Ajuste manual de stock</p>
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
            <h2 className="card-title">Detalles del Ajuste</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 2fr) 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Producto *</label>
              <select
                className="input-field"
                value={form.productId}
                onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                required
              >
                <option value="">Seleccionar...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.sku}] {p.name} (Stock: {Number(p.currentStock).toLocaleString('es-AR')})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Tipo *</label>
              <select
                className="input-field"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                required
              >
                <option value="IN">Entrada (+)</option>
                <option value="OUT">Salida (-)</option>
                <option value="ADJUSTMENT">Ajuste Absoluto(=)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="input-group">
              <label className="input-label">
                Cantidad ({selectedProduct?.baseUnit?.symbol || 'u'}) *
              </label>
              <input
                type="number"
                className="input-field"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            {selectedProduct && (
              <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Stock Actual: <strong>{Number(selectedProduct.currentStock).toLocaleString('es-AR')}</strong>
                </div>
                {newStockPreview !== null && (
                  <div style={{ 
                    fontSize: '14px', marginTop: '4px',
                    color: newStockPreview < 0 ? 'var(--color-danger)' : 'var(--text-primary)' 
                  }}>
                    Stock Final: <strong>{newStockPreview.toLocaleString('es-AR')}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="input-group" style={{ marginTop: '16px' }}>
            <label className="input-label">Motivo u Observaciones</label>
            <input
              className="input-field"
              placeholder="Ej: Rotura en depósito, ingreso por devolución..."
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link href="/dashboard/stock" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Procesando...' : 'Confirmar Ajuste'}
          </button>
        </div>
      </form>
    </div>
  );
}
