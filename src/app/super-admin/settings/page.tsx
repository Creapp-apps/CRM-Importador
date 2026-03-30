'use client';

import { useState } from 'react';
import { Save, Server, Shield, Mail } from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    platformName: 'GESTOR INTERNO',
    supportEmail: 'soporte@creapp.ar',
    allowNewRegistrations: true,
    maintenanceMode: false,
    mrrTarget: '1000000',
    afipMode: 'homologacion',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          Configuración de la Plataforma
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Ajustes globales, facturación y mantenimiento
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Server size={20} color="#8b5cf6" />
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Ajustes Generales</h2>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label className="input-label">Nombre de la Plataforma</label>
                <input type="text" className="input-field" value={form.platformName}
                  onChange={e => setForm(f => ({ ...f, platformName: e.target.value }))} />
              </div>
              <div>
                <label className="input-label">Email de Soporte Global</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input type="email" className="input-field" style={{ paddingLeft: '36px' }}
                    value={form.supportEmail} onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', background: 'var(--bg-root)', borderRadius: '12px',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>Permitir nuevos registros</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Las importadoras pueden registrarse por su cuenta en /register</div>
              </div>
              <input type="checkbox" checked={form.allowNewRegistrations}
                onChange={e => setForm(f => ({ ...f, allowNewRegistrations: e.target.checked }))}
                style={{ width: '20px', height: '20px', accentColor: '#8b5cf6' }} />
            </div>
          </div>
        </div>

        {/* Security & Integrations */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={20} color="#f59e0b" />
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Seguridad e Integraciones</h2>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="input-label">Entorno SDK AFIP (Global)</label>
              <select className="input-field" value={form.afipMode}
                onChange={e => setForm(f => ({ ...f, afipMode: e.target.value }))}>
                <option value="homologacion">Homologación (Testing)</option>
                <option value="produccion">Producción (Operativo)</option>
              </select>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Si está en Homologación, los comprobantes generados no tendrán validez fiscal real.
              </p>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px', border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px',
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#f87171' }}>Modo Mantenimiento</div>
                <div style={{ fontSize: '13px', color: '#fca5a5' }}>Bloquea el acceso a todas las importadoras mostrando una pantalla de actualización.</div>
              </div>
              <input type="checkbox" checked={form.maintenanceMode}
                onChange={e => setForm(f => ({ ...f, maintenanceMode: e.target.checked }))}
                style={{ width: '20px', height: '20px', accentColor: '#ef4444' }} />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: '8px' }}>
            <Save size={18} />
            {loading ? 'Guardando...' : 'Guardar Configuración'}
          </button>
          
          {saved && (
            <span style={{ fontSize: '14px', color: '#34d399', fontWeight: 500, animation: 'fadeIn 0.3s ease' }}>
              ✓ Configuración guardada con éxito
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
