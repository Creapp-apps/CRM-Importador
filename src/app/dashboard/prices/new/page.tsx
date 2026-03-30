'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';

export default function NewPriceRulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [customers, setCustomers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [applyToCustomerType, setApplyToCustomerType] = useState('ALL'); // ALL, CUSTOMER, CATEGORY
  const [applyToProductType, setApplyToProductType] = useState('ALL'); // ALL, PRODUCT

  const [form, setForm] = useState({
    name: '',
    customerId: '',
    customerCategoryId: '',
    productId: '',
    ruleType: 'PERCENTAGE_OFF',
    value: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    priority: '0',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/customer-categories').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([custData, catData, prodData]) => {
      if (Array.isArray(custData)) setCustomers(custData);
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(prodData)) setProducts(prodData);
    }).catch(console.error);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...form };
      if (applyToCustomerType !== 'CUSTOMER') payload.customerId = '';
      if (applyToCustomerType !== 'CATEGORY') payload.customerCategoryId = '';
      if (applyToProductType !== 'PRODUCT') payload.productId = '';

      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear regla');
      }

      router.push('/dashboard/prices');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear regla');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard/prices" className="btn btn-ghost btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">Nueva Regla de Precio</h1>
          <p className="page-subtitle">Definí políticas de precios personalizadas</p>
        </div>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Información Básica</h2>
              </div>
              <div className="input-group">
                <label className="input-label">Nombre de la Regla *</label>
                <input
                  className="input-field"
                  placeholder="Ej: Descuento Mayoristas 15%"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Tipo de Modificador *</label>
                  <select
                    className="input-field"
                    value={form.ruleType}
                    onChange={e => setForm(f => ({ ...f, ruleType: e.target.value }))}
                  >
                    <option value="PERCENTAGE_OFF">Descuento Porcentual (%)</option>
                    <option value="FIXED_DISCOUNT">Descuento Fijo ($)</option>
                    <option value="MARKUP">Recargo / Markup (%)</option>
                    <option value="FIXED_PRICE">Precio Fijo Exacto ($)</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Valor del Modificador *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="Ej: 15"
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Condiciones de Aplicación</h2>
              </div>
              
              <div className="input-group">
                <label className="input-label">Aplicar a Cliente(s)</label>
                <select
                  className="input-field"
                  value={applyToCustomerType}
                  onChange={e => setApplyToCustomerType(e.target.value)}
                >
                  <option value="ALL">Todos los clientes</option>
                  <option value="CATEGORY">Clientes de una Categoría</option>
                  <option value="CUSTOMER">Un Cliente Específico</option>
                </select>
              </div>

              {applyToCustomerType === 'CATEGORY' && (
                <div className="input-group" style={{ marginTop: '12px' }}>
                  <label className="input-label">Seleccionar Categoría *</label>
                  <select
                    className="input-field"
                    value={form.customerCategoryId}
                    onChange={e => setForm(f => ({ ...f, customerCategoryId: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {applyToCustomerType === 'CUSTOMER' && (
                <div className="input-group" style={{ marginTop: '12px' }}>
                  <label className="input-label">Seleccionar Cliente *</label>
                  <select
                    className="input-field"
                    value={form.customerId}
                    onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.tradeName || c.businessName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-group" style={{ marginTop: '24px' }}>
                <label className="input-label">Aplicar a Producto(s)</label>
                <select
                  className="input-field"
                  value={applyToProductType}
                  onChange={e => setApplyToProductType(e.target.value)}
                >
                  <option value="ALL">Todos los productos</option>
                  <option value="PRODUCT">Un Producto Específico</option>
                </select>
              </div>

              {applyToProductType === 'PRODUCT' && (
                <div className="input-group" style={{ marginTop: '12px' }}>
                  <label className="input-label">Seleccionar Producto *</label>
                  <select
                    className="input-field"
                    value={form.productId}
                    onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Configuración</h2>
            </div>
            
            <div className="input-group">
              <label className="input-label">Prioridad</label>
              <input
                type="number"
                className="input-field"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Si un producto cumple varias reglas, se aplica la de mayor prioridad.
              </span>
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label className="input-label">Válido Desde *</label>
              <input
                type="date"
                className="input-field"
                value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                required
              />
            </div>

            <div className="input-group" style={{ marginTop: '16px' }}>
              <label className="input-label">Válido Hasta</label>
              <input
                type="date"
                className="input-field"
                value={form.validUntil}
                onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Dejar en blanco para que no tenga vencimiento.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }} disabled={loading}>
              <Tag size={18} style={{ marginRight: '8px' }} />
              {loading ? 'Guardando...' : 'Guardar Regla'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
