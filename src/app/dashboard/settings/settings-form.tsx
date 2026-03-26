'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tenant } from '@prisma/client';
import PickLocationMap from '@/components/maps/MapWrapper';
import { MapPin, Search } from 'lucide-react';

export default function SettingsForm({ initialData }: { initialData: Tenant }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSearchingMap, setIsSearchingMap] = useState(false);

  const [form, setForm] = useState({
    logisticBaseAddress: initialData.logisticBaseAddress || '',
    logisticBaseLat: initialData.logisticBaseLat ? Number(initialData.logisticBaseLat) : -34.6037, // default bs  as
    logisticBaseLng: initialData.logisticBaseLng ? Number(initialData.logisticBaseLng) : -58.3816,
  });

  async function handleGeocode() {
    if (!form.logisticBaseAddress) {
      setError('Escribí una dirección para buscarla');
      return;
    }

    setIsSearchingMap(true);
    setError('');
    try {
      // Nominatim requires a user-agent theoretically, but works in browser simply
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.logisticBaseAddress + ', Argentina')}&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        setForm(f => ({
          ...f,
          logisticBaseLat: Number(data[0].lat),
          logisticBaseLng: Number(data[0].lon)
        }));
      } else {
        setError('No se pudo encontrar la dirección exacta. Por favor, agregá ciudad o provincia, o mové el pin manualmente.');
      }
    } catch (err) {
      setError('Error conectando con el servicio de mapas (OpenStreetMap).');
    } finally {
      setIsSearchingMap(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      setSuccess('Configuración guardada exitosamente.');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={20} className="text-primary" />
          Base Logística
        </h2>
        <p className="card-description" style={{ marginTop: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Esta es la dirección desde donde salen tus repartidores. Se usa para calcular las rutas y optimizar las distancias.
        </p>
      </div>

      {error && <div className="login-error" style={{ marginBottom: '16px' }}>{error}</div>}
      {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Dirección de la Fábrica / Depósito *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Ej. Avellaneda 1234, CABA"
              value={form.logisticBaseAddress}
              onChange={e => setForm(f => ({ ...f, logisticBaseAddress: e.target.value }))}
              required
            />
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleGeocode}
              disabled={isSearchingMap}
              title="Buscar en el mapa"
            >
              <Search size={18} />
              <span className="hide-on-mobile">{isSearchingMap ? 'Buscando...' : 'Ubicar'}</span>
            </button>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
            Podés buscar tu dirección para autocompletar el mapa, y luego ajustar el pin arrastrándolo o haciendo clic.
          </span>
        </div>

        <div style={{ marginTop: '24px', marginBottom: '24px' }}>
          <label className="input-label" style={{ marginBottom: '12px' }}>Ajuste fino de ubicación</label>
          {/* Force re-render of map completely when coords jump drastically from geocode to bypass deep state issues by keying */}
          <PickLocationMap 
            key={`${form.logisticBaseLat}-${form.logisticBaseLng}`}
            initialLat={form.logisticBaseLat} 
            initialLng={form.logisticBaseLng} 
            onChange={(lat, lng) => setForm(f => ({ ...f, logisticBaseLat: lat, logisticBaseLng: lng }))}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
             <div className="input-group">
               <label className="input-label">Latitud (Auto)</label>
               <input type="text" className="input-field" disabled value={form.logisticBaseLat} style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}/>
             </div>
             <div className="input-group">
               <label className="input-label">Longitud (Auto)</label>
               <input type="text" className="input-field" disabled value={form.logisticBaseLng} style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}/>
             </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Coordenadas'}
          </button>
        </div>
      </form>
    </div>
  );
}
