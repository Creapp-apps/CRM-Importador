'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface UoM {
  id: string;
  name: string;
  symbol: string;
  category: string;
}

interface PresentationInput {
  id?: string;
  name: string;
  shortName: string;
  barcode: string;
  conversionFactor: string;
  packDescription: string;
  isDefault: boolean;
}

export default function EditProductForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [uoms, setUoms] = useState<UoM[]>([]);

  const [form, setForm] = useState({
    sku: initialData.sku || '',
    name: initialData.name || '',
    description: initialData.description || '',
    brand: initialData.brand || '',
    category: initialData.category || '',
    baseUnitId: initialData.baseUnitId || '',
    baseUnitWeight: initialData.baseUnitWeight ? String(initialData.baseUnitWeight) : '',
    currentStock: String(initialData.currentStock || 0),
    minimumStock: String(initialData.minimumStock || 0),
    isActive: initialData.isActive,
  });

  const [presentations, setPresentations] = useState<PresentationInput[]>(
    initialData.presentations?.map((p: any) => ({
      id: p.id,
      name: p.name,
      shortName: p.shortName || '',
      barcode: p.barcode || '',
      conversionFactor: String(p.conversionFactor || 1),
      packDescription: p.packDescription || '',
      isDefault: p.isDefault,
    })) || []
  );

  useEffect(() => {
    fetch('/api/uom')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setUoms(data);
      })
      .catch(() => {});
  }, []);

  function addPresentation() {
    setPresentations(prev => [...prev, {
      name: '',
      shortName: '',
      barcode: '',
      conversionFactor: '1',
      packDescription: '',
      isDefault: prev.length === 0,
    }]);
  }

  function removePresentation(index: number) {
    setPresentations(prev => prev.filter((_, i) => i !== index));
  }

  function updatePresentation(index: number, field: keyof PresentationInput, value: string | boolean) {
    setPresentations(prev => prev.map((p, i) => {
      if (i !== index) return p;
      return { ...p, [field]: value };
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          baseUnitWeight: form.baseUnitWeight ? Number(form.baseUnitWeight) : null,
          currentStock: form.currentStock ? Number(form.currentStock) : 0,
          minimumStock: form.minimumStock ? Number(form.minimumStock) : 0,
          presentations: presentations.map(p => ({
            ...p,
            conversionFactor: Number(p.conversionFactor),
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar producto');
      }

      toast.success('Producto actualizado correctamente');
      router.push('/dashboard/products');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar producto');
      setError(err instanceof Error ? err.message : 'Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Estás seguro de que querés eliminar este producto? Esta acción eliminará también sus presentaciones y no se puede deshacer.')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${initialData.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar producto');
      
      toast.success('Producto eliminado con éxito');
      router.push('/dashboard/products');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar producto');
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
      setDeleting(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/products" className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Editar Producto</h1>
            <p className="page-subtitle">{initialData.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="btn btn-secondary"
          style={{ color: 'var(--color-danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
        >
          <Trash2 size={16} />
          {deleting ? 'Eliminando...' : 'Eliminar Producto'}
        </button>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Product Info */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Información del Producto</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">SKU *</label>
              <input
                className="input-field"
                value={form.sku}
                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                required
              />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label">Nombre *</label>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Marca</label>
              <input
                className="input-field"
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Categoría</label>
              <input
                className="input-field"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              />
            </div>
          </div>

          <div className="input-group">
             <label className="input-label">Estado</label>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
               <input
                 type="checkbox"
                 id="isActive"
                 checked={form.isActive}
                 onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                 style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
               />
               <label htmlFor="isActive" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Producto Activo</label>
             </div>
          </div>

          <div className="input-group" style={{ marginTop: '16px' }}>
            <label className="input-label">Descripción</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Stock & Units */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Stock y Unidades</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Unidad Base *</label>
              <select
                className="input-field"
                value={form.baseUnitId}
                onChange={e => setForm(f => ({ ...f, baseUnitId: e.target.value }))}
                required
              >
                <option value="">Seleccionar...</option>
                {uoms.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Peso unidad base (g)</label>
              <input
                type="number"
                className="input-field"
                value={form.baseUnitWeight}
                onChange={e => setForm(f => ({ ...f, baseUnitWeight: e.target.value }))}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Ej: 500. Sirve para calcular el peso logístico.</span>
            </div>
            <div className="input-group">
              <label className="input-label">Stock Actual</label>
              <input
                type="number"
                className="input-field"
                value={form.currentStock}
                onChange={e => setForm(f => ({ ...f, currentStock: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Stock Mínimo</label>
              <input
                type="number"
                className="input-field"
                value={form.minimumStock}
                onChange={e => setForm(f => ({ ...f, minimumStock: e.target.value }))}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Alerta al bajar de este valor.</span>
            </div>
          </div>
        </div>

        {/* Presentations */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Presentaciones</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addPresentation}>
              <Plus size={16} />
              Agregar Presentación
            </button>
          </div>

          {presentations.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-state-icon" style={{ width: '48px', height: '48px' }}>
                <Package size={22} />
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Agregá las presentaciones del producto (ej: Funda 20 x 500g)
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {presentations.map((p, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    background: 'var(--bg-surface)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Presentación {i + 1}
                    </span>
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removePresentation(i)}>
                      <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="input-label">Nombre *</label>
                      <input
                        className="input-field"
                        value={p.name}
                        onChange={e => updatePresentation(i, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Código Corto</label>
                      <input
                        className="input-field"
                        value={p.shortName}
                        onChange={e => updatePresentation(i, 'shortName', e.target.value)}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Abreviación para remitos (ej: F20)</span>
                    </div>
                    <div>
                      <label className="input-label">Código de Barras</label>
                      <input
                        className="input-field"
                        value={p.barcode}
                        onChange={e => updatePresentation(i, 'barcode', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="input-label">Factor Conversión *</label>
                      <input
                        type="number"
                        className="input-field"
                        value={p.conversionFactor}
                        onChange={e => updatePresentation(i, 'conversionFactor', e.target.value)}
                        required
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Cant. de Unidades Base que trae. (Ej: 20)</span>
                    </div>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <label className="input-label">Descripción del empaquetado</label>
                    <input
                      className="input-field"
                      value={p.packDescription}
                      onChange={e => updatePresentation(i, 'packDescription', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link href="/dashboard/products" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
