'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
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

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const [form, setForm] = useState({
    customerType: 'BUSINESS',
    businessName: '',
    tradeName: '',
    cuit: '',
    contactName: '',
    contactRole: '',
    acquisitionChannel: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    latitude: -34.6037,
    longitude: -58.3816,
    categoryId: '',
    salesChannel: '',
    creditLimit: '',
    notes: '',
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
      const res = await fetch('/api/customers', {
        method: 'POST',
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
        throw new Error(data.error || 'Error al crear cliente');
      }

      router.push('/dashboard/customers');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/customers" className="btn btn-ghost btn-icon">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="page-title">Nuevo Cliente</h1>
            <p className="page-subtitle">Registrá un nuevo cliente con sus datos comerciales</p>
          </div>
        </div>
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
                onChange={e => setForm(f => ({ ...f, customerType: e.target.value }))}
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
                placeholder={form.customerType === 'BUSINESS' ? 'Distribuidora Norte S.R.L.' : 'Juan Pérez'}
                value={form.businessName}
                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Nombre de Fantasía</label>
              <input
                className="input-field"
                placeholder="Opcional"
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
                placeholder="30-99887766-5"
                value={form.cuit}
                onChange={e => setForm(f => ({ ...f, cuit: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Persona de Contacto</label>
              <input
                className="input-field"
                placeholder="Ej. María Gómez"
                value={form.contactName}
                onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Rol en Empresa</label>
              <input
                className="input-field"
                placeholder="Ej. Dueño, Encargado Compras"
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
                placeholder="contacto@empresa.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Teléfono</label>
              <input
                className="input-field"
                placeholder="+54 11 5555-0001"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">¿Cómo nos conoció?</label>
              <input
                className="input-field"
                placeholder="Ej. Instagram, Recomendación"
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
                placeholder="Av. San Martín 456"
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
                placeholder="Buenos Aires"
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
                placeholder="C1001"
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
            </div>
            <div className="input-group">
              <label className="input-label">Límite de Crédito ($)</label>
              <input
                type="number"
                className="input-field"
                placeholder="100000"
                value={form.creditLimit}
                onChange={e => setForm(f => ({ ...f, creditLimit: e.target.value }))}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Notas</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Observaciones sobre el cliente..."
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
            {loading ? 'Guardando...' : 'Crear Cliente'}
          </button>
        </div>
      </form>
    </div>
  );
}
