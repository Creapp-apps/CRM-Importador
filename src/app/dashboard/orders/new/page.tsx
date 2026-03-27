'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';

interface Customer {
  id: string;
  businessName: string;
  tradeName?: string;
  category?: { discount?: number };
}

interface ProductPresentation {
  id: string;
  name: string;
  shortName?: string;
  conversionFactor: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  presentations: ProductPresentation[];
}

interface OrderItemInput {
  productId: string;
  presentationId: string;
  quantity: string;
  unitPrice: string;
  discount: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState({
    customerId: '',
    status: 'DRAFT',
    notes: '',
  });

  const [items, setItems] = useState<OrderItemInput[]>([]);
  const [discountTotal, setDiscountTotal] = useState('');
  const [taxTotal, setTaxTotal] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([custData, prodData]) => {
      if (Array.isArray(custData)) setCustomers(custData);
      if (Array.isArray(prodData)) setProducts(prodData);
    }).catch(console.error);
  }, []);

  function addItem() {
    setItems(prev => [...prev, {
      productId: '',
      presentationId: '',
      quantity: '1',
      unitPrice: '',
      discount: '0',
    }]);
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof OrderItemInput, value: string) {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      
      const updated = { ...item, [field]: value };
      
      // If product changes, auto-select first presentation
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product && product.presentations.length > 0) {
          updated.presentationId = product.presentations[0].id;
        } else {
          updated.presentationId = '';
        }
      }
      
      return updated;
    }));
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const dsc = Number(item.discount) || 0;
    return sum + (qty * price) - dsc;
  }, 0);

  const total = subtotal - (Number(discountTotal) || 0) + (Number(taxTotal) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Debes agregar al menos un producto al pedido');
      return;
    }

    if (items.some(i => !i.presentationId || Number(i.quantity) <= 0 || Number(i.unitPrice) <= 0)) {
      setError('Verificá que todos los items tengan cantidad y precio mayor a 0');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          discountTotal: Number(discountTotal) || 0,
          taxTotal: Number(taxTotal) || 0,
          items: items.map(i => ({
            presentationId: i.presentationId,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            discount: Number(i.discount) || 0,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear pedido');
      }

      router.push('/dashboard/orders');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear pedido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/orders" className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Nuevo Pedido</h1>
            <p className="page-subtitle">Crear orden de venta</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Datos Principales</h2>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Cliente *</label>
              <select
                className="input-field"
                value={form.customerId}
                onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                required
              >
                <option value="">Seleccionar cliente...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.tradeName || c.businessName} {c.category?.discount ? `(${c.category.discount}% dto base)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Estado Inicial *</label>
              <select
                className="input-field"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                required
              >
                <option value="DRAFT">Borrador</option>
                <option value="CONFIRMED">Confirmado</option>
                <option value="PREPARING">En Preparación</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Líneas de Pedido</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>
              <Plus size={16} />
              Agregar Producto
            </button>
          </div>

          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-state-icon" style={{ width: '48px', height: '48px' }}>
                <ShoppingCart size={22} />
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Agregá los productos que componen este pedido
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item, i) => {
                const product = products.find(p => p.id === item.productId);
                const itemSubtotal = (Number(item.quantity) * Number(item.unitPrice)) - Number(item.discount);
                
                return (
                  <div key={i} style={{
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                    padding: '16px', background: 'var(--bg-surface)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Ítem {i + 1}</span>
                      <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeItem(i)}>
                        <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 1.5fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <label className="input-label">Producto *</label>
                        <select
                          className="input-field"
                          value={item.productId}
                          onChange={e => updateItem(i, 'productId', e.target.value)}
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="input-label">Presentación *</label>
                        <select
                          className="input-field"
                          value={item.presentationId}
                          onChange={e => updateItem(i, 'presentationId', e.target.value)}
                          required
                          disabled={!product || product.presentations.length === 0}
                        >
                          <option value="">Seleccionar...</option>
                          {product?.presentations.map(pres => (
                            <option key={pres.id} value={pres.id}>
                              {pres.shortName || pres.name} (x{Number(pres.conversionFactor)})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="input-label">Cantidad *</label>
                        <input
                          type="number"
                          className="input-field"
                          value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', e.target.value)}
                          required
                          min="0.01"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="input-label">Prec. Unit ($) *</label>
                        <input
                          type="number"
                          className="input-field"
                          value={item.unitPrice}
                          onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                          required
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="input-label">Dto ($)</label>
                        <input
                          type="number"
                          className="input-field"
                          value={item.discount}
                          onChange={e => updateItem(i, 'discount', e.target.value)}
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div style={{ paddingBottom: '8px', textAlign: 'right', minWidth: '80px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Subtotal</div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          ${itemSubtotal > 0 ? itemSubtotal.toLocaleString('es-AR') : '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h2 className="card-title">Notas del Pedido</h2>
            </div>
            <textarea
              className="input-field"
              rows={4}
              placeholder="Instrucciones de entrega, comentarios..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="card" style={{ width: '350px' }}>
            <div className="card-header">
              <h2 className="card-title">Resumen</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal Items</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Descuento Extra ($)</span>
                <input
                  type="number"
                  className="input-field"
                  style={{ width: '120px', textAlign: 'right' }}
                  value={discountTotal}
                  onChange={e => setDiscountTotal(e.target.value)}
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Impuestos/Cargos ($)</span>
                <input
                  type="number"
                  className="input-field"
                  style={{ width: '120px', textAlign: 'right' }}
                  value={taxTotal}
                  onChange={e => setTaxTotal(e.target.value)}
                  min="0"
                />
              </div>

              <div style={{
                marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: '18px', fontWeight: 700, color: 'var(--color-primary-light)'
              }}>
                <span>Total</span>
                <span>${total > 0 ? total.toLocaleString('es-AR') : '0'}</span>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
