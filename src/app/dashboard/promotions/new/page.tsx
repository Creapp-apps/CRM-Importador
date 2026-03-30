'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Megaphone } from 'lucide-react';
import Link from 'next/link';

export default function NewPromotionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'PERCENTAGE_OFF',
    value: '',
    minQuantity: '',
    minAmount: '',
    appliesToAll: true,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
  });

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/customer-categories').then(r => r.json()),
      fetch('/api/products').then(r => r.json()),
    ]).then(([catData, prodData]) => {
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(prodData)) setProducts(prodData);
    }).catch(console.error);
  }, []);

  function toggleSet(setter: any, id: string) {
    setter((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.validUntil) {
      setError('Toda promoción debe tener una fecha de vencimiento.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...form,
        categoryIds: Array.from(selectedCategories),
        productIds: Array.from(selectedProducts),
      };

      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear promoción');
      }

      router.push('/dashboard/promotions');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear promoción');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard/promotions" className="btn btn-ghost btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">Nueva Promoción</h1>
          <p className="page-subtitle">Diseñá descuentos masivos y campañas especiales</p>
        </div>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Campaña y Modificador</h2>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Nombre de la Promoción *</label>
                  <input
                    className="input-field"
                    placeholder="Ej: Hot Week 2026"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Descripción</label>
                  <input
                    className="input-field"
                    placeholder="Slogan interno..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Tipo de Modificador *</label>
                  <select
                    className="input-field"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    <option value="PERCENTAGE_OFF">Descuento (%)</option>
                    <option value="FIXED_DISCOUNT">Rebaja Exacta ($)</option>
                    <option value="VOLUME_DISCOUNT">Descuento Multicompra</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Valor del Descuento *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    placeholder="Ej: 20"
                    value={form.value}
                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Reglas de Activación</h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Gasto Mínimo Requerido ($)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Ej: 50000"
                    value={form.minAmount}
                    onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Dejar en blanco si se activa siempre.
                  </span>
                </div>
                <div className="input-group">
                  <label className="input-label">Unidades Mínimas (u)</label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Ej: 10"
                    value={form.minQuantity}
                    onChange={e => setForm(f => ({ ...f, minQuantity: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">A qué aplica</h2>
              </div>
              
              <div className="input-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <input
                    type="checkbox"
                    id="appliesToAll"
                    checked={form.appliesToAll}
                    onChange={e => setForm(f => ({ ...f, appliesToAll: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                  />
                  <div>
                    <label htmlFor="appliesToAll" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                      Aplicar a todo el catálogo sin restricción
                    </label>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Si desmarcás esto, podrás elegir categorías y productos específicos abajo.
                    </p>
                  </div>
                </div>
              </div>

              {!form.appliesToAll && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label className="input-label" style={{ marginBottom: '12px' }}>Limitado a Categorías:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                      {categories.map(c => (
                        <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedCategories.has(c.id)} onChange={() => toggleSet(setSelectedCategories, c.id)} />
                          {c.name}
                        </label>
                      ))}
                      {categories.length === 0 && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay categorías</span>}
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label className="input-label" style={{ marginBottom: '12px' }}>Limitado a Productos:</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                      {products.map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={selectedProducts.has(p.id)} onChange={() => toggleSet(setSelectedProducts, p.id)} />
                          {p.name}
                        </label>
                      ))}
                      {products.length === 0 && <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No hay productos</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="card" style={{ position: 'sticky', top: '24px' }}>
            <div className="card-header">
              <h2 className="card-title">Vigencia</h2>
            </div>

            <div className="input-group">
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
              <label className="input-label">Válido Hasta *</label>
              <input
                type="date"
                className="input-field"
                value={form.validUntil}
                onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                required
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Obligatorio para evitar campañas eternas que perjudiquen el margen comercial.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }} disabled={loading}>
              <Megaphone size={18} style={{ marginRight: '8px' }} />
              {loading ? 'Lanzando...' : 'Crear Campaña'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
