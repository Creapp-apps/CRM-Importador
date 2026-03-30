'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Search } from 'lucide-react';
import Link from 'next/link';
import { Customer } from '@prisma/client';
import PickLocationMap from '@/components/maps/MapWrapper';

interface Category {
  id: string;
  name: string;
  color: string | null;
  discount: number | null;
}

const SALES_CHANNELS = [
  { value: 'DIRECT', label: 'Venta Directa' },
  { value: 'DISTRIBUTOR', label: 'Distribuidor' },
  { value: 'ECOMMERCE', label: 'E-Commerce' },
  { value: 'WHOLESALE', label: 'Mayorista' },
];

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

export default function EditCustomerForm({ initialData }: { initialData: Customer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const [form, setForm] = useState({
    customerType: initialData.customerType || 'BUSINESS',
    businessName: initialData.businessName || '',
    tradeName: initialData.tradeName || '',
    cuit: initialData.cuit || '',
    contactName: initialData.contactName || '',
    contactRole: initialData.contactRole || '',
    acquisitionChannel: initialData.acquisitionChannel || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    city: initialData.city || '',
    province: initialData.province || '',
    postalCode: initialData.postalCode || '',
    latitude: initialData.latitude ? Number(initialData.latitude) : -34.6037,
    longitude: initialData.longitude ? Number(initialData.longitude) : -58.3816,
    categoryId: initialData.categoryId || '',
    salesChannel: initialData.salesChannel || '',
    creditLimit: initialData.creditLimit ? String(initialData.creditLimit) : '',
    notes: initialData.notes || '',
    isActive: initialData.isActive,
  });

  useEffect(() => {
    fetch('/api/customer-categories')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  async function handleGeocode() {
    const fullAddress = `${form.address}, ${form.city || ''}, ${form.province || ''}, Argentina`.replace(/,\s*,/g, ',');
    
    setIsSearchingMap(true);
    setError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        setForm(f => ({
          ...f,
          latitude: Number(data[0].lat),
          longitude: Number(data[0].lon)
        }));
      } else {
        setError('No se pudo encontrar la dirección exacta. Ajustá el pin manualmente en el mapa.');
      }
    } catch (err) {
      setError('Error al buscar la dirección en el mapa.');
    } finally {
      setIsSearchingMap(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${initialData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          creditLimit: form.creditLimit ? Number(form.creditLimit) : null,
          categoryId: form.categoryId || null,
          salesChannel: form.salesChannel || null,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar cliente');
      }

      router.push('/dashboard/customers');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cliente');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('¿Estás seguro de que querés eliminar este cliente? Esta acción no se puede deshacer.')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${initialData.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar cliente');
      
      router.push('/dashboard/customers');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cliente');
      setDeleting(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/customers" className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Editar Cliente</h1>
            <p className="page-subtitle">{initialData.businessName}</p>
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
          {deleting ? 'Eliminando...' : 'Eliminar Cliente'}
        </button>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Datos del Cliente</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="input-group">
              <label className="input-label">Tipo de Cliente</label>
              <select
                className="input-field"
                value={form.customerType}
                onChange={e => setForm(f => ({ ...f, customerType: e.target.value as 'BUSINESS' | 'INDIVIDUAL' }))}
              >
                <option value="BUSINESS">Empresa / Negocio</option>
                <option value="INDIVIDUAL">Revendedor Individual</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">
                {form.customerType === 'BUSINESS' ? 'Razón Social *' : 'Nombre Completo *'}
              </label>
              <input
                className="input-field"
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Nombre de Fantasía</label>
              <input
                className="input-field"
                value={form.tradeName}
                onChange={e => setForm(f => ({ ...f, tradeName: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="input-group">
              <label className="input-label">CUIT / DNI</label>
              <input
                className="input-field"
                value={form.cuit}
                onChange={e => setForm(f => ({ ...f, cuit: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Persona de Contacto</label>
              <input
                className="input-field"
                value={form.contactName}
                onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Rol en Empresa</label>
              <input
                className="input-field"
                value={form.contactRole}
                onChange={e => setForm(f => ({ ...f, contactRole: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Teléfono</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">¿Cómo nos conoció?</label>
              <input
                className="input-field"
                value={form.acquisitionChannel}
                onChange={e => setForm(f => ({ ...f, acquisitionChannel: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Ubicación</h2>
          </div>

          <div className="input-group">
            <label className="input-label">Dirección (Calle y Número) *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="input-field"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                required
              />
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleGeocode}
                disabled={isSearchingMap || !form.address}
                title="Buscar en el mapa"
              >
                <Search size={18} />
                <span className="hide-on-mobile">{isSearchingMap ? 'Buscando...' : 'Ubicar'}</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Ciudad</label>
              <input
                className="input-field"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Provincia</label>
              <select
                className="input-field"
                value={form.province}
                onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
              >
                <option value="">Seleccionar...</option>
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Código Postal</label>
              <input
                className="input-field"
                value={form.postalCode}
                onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', marginBottom: '8px' }}>
            <label className="input-label" style={{ marginBottom: '8px' }}>Ubicación Exacta (Mapa)</label>
            <PickLocationMap 
              key={`${form.latitude}-${form.longitude}`}
              initialLat={form.latitude} 
              initialLng={form.longitude} 
              onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
              Confirmá que el pin esté en el lugar correcto para optimizar el recorrido logístico.
            </span>
          </div>
        </div>

        {/* Commercial */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h2 className="card-title">Datos Comerciales</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Categoría</label>
              <select
                className="input-field"
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Sin categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.discount ? `(${c.discount}% dto)` : ''}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Aplica descuentos globales al cliente.</span>
            </div>
            <div className="input-group">
              <label className="input-label">Canal de Venta</label>
              <select
                className="input-field"
                value={form.salesChannel}
                onChange={e => setForm(f => ({ ...f, salesChannel: e.target.value }))}
              >
                <option value="">Seleccionar...</option>
                {SALES_CHANNELS.map(ch => (
                  <option key={ch.value} value={ch.value}>{ch.label}</option>
                ))}
              </select>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Sirve para reportes y ruteo.</span>
            </div>
            <div className="input-group">
              <label className="input-label">Límite de Crédito ($)</label>
              <input
                type="number"
                className="input-field"
                value={form.creditLimit}
                onChange={e => setForm(f => ({ ...f, creditLimit: e.target.value }))}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Dejar en blanco para ilimitado.</span>
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
               <label htmlFor="isActive" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Cliente Activo</label>
             </div>
          </div>

          <div className="input-group" style={{ marginTop: '16px' }}>
            <label className="input-label">Notas</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link href="/dashboard/customers" className="btn btn-secondary">
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
