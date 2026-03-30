'use client';

import { useState, useEffect } from 'react';
import { Settings2, Plus, Trash2, Scale } from 'lucide-react';
import { toast } from 'sonner';

interface UoM {
  id: string;
  name: string;
  symbol: string;
  category: string;
}

const CATEGORIES = [
  { value: 'WEIGHT', label: 'Peso' },
  { value: 'VOLUME', label: 'Volumen' },
  { value: 'UNIT', label: 'Unidad' },
  { value: 'LENGTH', label: 'Longitud' },
];

export default function UoMManager() {
  const [uoms, setUoms] = useState<UoM[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    symbol: '',
    category: 'WEIGHT',
  });

  useEffect(() => {
    loadUoms();
  }, []);

  async function loadUoms() {
    try {
      const res = await fetch('/api/uom');
      if (res.ok) {
        const data = await res.json();
        setUoms(data);
      }
    } catch {
      toast.error('Error cargando unidades de medida');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.symbol || !form.category) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/uom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear');
      }

      toast.success('Unidad de medida creada');
      setForm({ name: '', symbol: '', category: 'WEIGHT' });
      loadUoms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Seguro que querés eliminar esta unidad de medida?')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/uom/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al eliminar');
      }
      
      toast.success('Unidad de medida eliminada');
      setUoms(prev => prev.filter(u => u.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo eliminar');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div className="card-header">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scale size={20} className="text-primary" />
          Unidades de Medida
        </h2>
        <p className="card-description" style={{ marginTop: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Gestioná cómo medís tu mercadería (kilos, gramos, litros, unidades).
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
        
        {/* Creation Form */}
        <div style={{ flex: '1 1 300px', background: 'var(--bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Nueva Unidad
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Nombre (ej: Kilogramos)</label>
              <input 
                className="input-field" 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Símbolo (ej: kg)</label>
              <input 
                className="input-field" 
                value={form.symbol} 
                onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                required
              />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label className="input-label">Categoría Física</label>
              <select 
                className="input-field"
                value={form.category} 
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                required
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={16} /> Agregar
            </button>
          </form>
        </div>

        {/* Existing Units List */}
        <div style={{ flex: '2 1 400px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Unidades Registradas
          </h3>
          
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Cargando unidades...</div>
          ) : uoms.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No creaste ninguna unidad todavía.</p>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table" style={{ width: '100%', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 12px' }}>Nombre</th>
                    <th style={{ padding: '8px 12px' }}>Símbolo</th>
                    <th style={{ padding: '8px 12px' }}>Tipo</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {uoms.map(uom => {
                     const catLabel = CATEGORIES.find(c => c.value === uom.category)?.label || uom.category;
                     return (
                      <tr key={uom.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{uom.name}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '2px 6px', background: 'var(--bg-secondary)', borderRadius: '4px', fontFamily: 'monospace' }}>
                            {uom.symbol}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{catLabel}</td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button 
                            type="button" 
                            onClick={() => handleDelete(uom.id)}
                            disabled={deletingId === uom.id}
                            className="btn btn-ghost btn-sm btn-icon" 
                            style={{ color: 'var(--color-danger)' }}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
