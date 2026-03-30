'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const PLANS = [
  { value: 'STARTER', label: 'Starter — Gratis' },
  { value: 'PROFESSIONAL', label: 'Professional — $X/mes' },
  { value: 'ENTERPRISE', label: 'Enterprise — $X/mes' },
];

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', cuit: '', email: '', phone: '',
    address: '', plan: 'STARTER',
    adminName: '', adminEmail: '', adminPassword: '',
  });

  function handleNameChange(value: string) {
    const slug = value
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setForm(f => ({ ...f, name: value, slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/super-admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear importadora');
      }

      router.push('/super-admin/tenants');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear importadora');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/super-admin/tenants" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Nueva Importadora
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Registrá una nueva empresa en la plataforma
          </p>
        </div>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Company Info */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
            Datos de la Empresa
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Razón Social *</label>
              <input className="input-field" placeholder="Importadora Sur S.A." value={form.name}
                onChange={e => handleNameChange(e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Slug (URL) *</label>
              <input className="input-field" placeholder="importadora-sur" value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required
                style={{ fontFamily: 'monospace' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">CUIT</label>
              <input className="input-field" placeholder="30-12345678-9" value={form.cuit}
                onChange={e => setForm(f => ({ ...f, cuit: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input type="email" className="input-field" placeholder="info@empresa.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Teléfono</label>
              <input className="input-field" placeholder="+54 11 4000-0000" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Dirección</label>
              <input className="input-field" placeholder="Av. Corrientes 1234, CABA" value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Plan *</label>
              <select className="input-field" value={form.plan}
                onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} required>
                {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Admin User */}
        <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(139,92,246,0.2)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Usuario Administrador
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Se creará automáticamente un usuario ADMIN para esta importadora
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Nombre *</label>
              <input className="input-field" placeholder="Juan García" value={form.adminName}
                onChange={e => setForm(f => ({ ...f, adminName: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Email *</label>
              <input type="email" className="input-field" placeholder="admin@empresa.com" value={form.adminEmail}
                onChange={e => setForm(f => ({ ...f, adminEmail: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Contraseña *</label>
              <input type="password" className="input-field" placeholder="Mínimo 8 caracteres" value={form.adminPassword}
                onChange={e => setForm(f => ({ ...f, adminPassword: e.target.value }))} minLength={8} required />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Link href="/super-admin/tenants" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: '8px' }}>
            {loading ? 'Creando...' : 'Crear Importadora'}
          </button>
        </div>
      </form>
    </div>
  );
}
