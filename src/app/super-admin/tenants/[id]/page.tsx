'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Building2, Users, Package, ShoppingCart,
  Truck, FileText, Tag, Trash2, ToggleLeft, ToggleRight,
  Mail, Phone, MapPin, Hash,
} from 'lucide-react';

const PLANS = [
  { value: 'STARTER', label: 'Starter', color: '#71717a' },
  { value: 'PROFESSIONAL', label: 'Professional', color: '#8b5cf6' },
  { value: 'ENTERPRISE', label: 'Enterprise', color: '#f59e0b' },
];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  VENDEDOR: 'Vendedor',
  DEPOSITO: 'Depósito',
  REPARTIDOR: 'Repartidor',
};

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  cuit: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  plan: string;
  isActive: boolean;
  createdAt: string;
  afipPuntoVenta: number | null;
  afipEnvironment: string;
  logisticBaseAddress: string | null;
  users: Array<{
    id: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }>;
  _count: {
    products: number;
    customers: number;
    orders: number;
    routes: number;
    priceRules: number;
    invoices: number;
  };
}

export default function TenantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const [form, setForm] = useState({
    name: '', slug: '', cuit: '', email: '', phone: '',
    address: '', plan: 'STARTER', isActive: true,
    afipPuntoVenta: '', afipEnvironment: 'TESTING',
    logisticBaseAddress: '',
  });

  const loadTenant = useCallback(async () => {
    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}`);
      if (!res.ok) throw new Error('Error al cargar importadora');
      const data = await res.json();
      setTenant(data);
      setForm({
        name: data.name || '',
        slug: data.slug || '',
        cuit: data.cuit || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        plan: data.plan || 'STARTER',
        isActive: data.isActive,
        afipPuntoVenta: data.afipPuntoVenta?.toString() || '',
        afipEnvironment: data.afipEnvironment || 'TESTING',
        logisticBaseAddress: data.logisticBaseAddress || '',
      });
    } catch {
      setError('No se pudo cargar la importadora');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => { loadTenant(); }, [loadTenant]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }
      setSuccess('Cambios guardados correctamente');
      setTimeout(() => setSuccess(''), 3000);
      loadTenant();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('⚠️ ¿Estás seguro? Se eliminarán TODOS los datos de esta importadora (productos, clientes, pedidos). Esta acción es IRREVERSIBLE.')) return;

    try {
      const res = await fetch(`/api/super-admin/tenants/${tenantId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      router.push('/super-admin/tenants');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  async function toggleActive() {
    setForm(f => ({ ...f, isActive: !f.isActive }));
    try {
      await fetch(`/api/super-admin/tenants/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !form.isActive }),
      });
      setSuccess(form.isActive ? 'Importadora desactivada' : 'Importadora activada');
      setTimeout(() => setSuccess(''), 3000);
      loadTenant();
    } catch {
      setError('Error al cambiar estado');
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Building2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-muted)' }}>Importadora no encontrada</p>
        <Link href="/super-admin/tenants" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          ← Volver
        </Link>
      </div>
    );
  }

  const statItems = [
    { label: 'Productos', value: tenant._count.products, icon: Package, color: '#8b5cf6' },
    { label: 'Clientes', value: tenant._count.customers, icon: Users, color: '#06b6d4' },
    { label: 'Pedidos', value: tenant._count.orders, icon: ShoppingCart, color: '#10b981' },
    { label: 'Rutas', value: tenant._count.routes, icon: Truck, color: '#f59e0b' },
    { label: 'Reg. Precios', value: tenant._count.priceRules, icon: Tag, color: '#ec4899' },
    { label: 'Facturas', value: tenant._count.invoices, icon: FileText, color: '#3b82f6' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <Link href="/super-admin/tenants" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {tenant.name}
            </h1>
            <span style={{
              fontSize: '12px', fontWeight: 500, padding: '3px 10px',
              borderRadius: '999px',
              background: form.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              color: form.isActive ? '#34d399' : '#f87171',
            }}>
              {form.isActive ? 'Activa' : 'Inactiva'}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            /{tenant.slug} · Creada el {new Date(tenant.createdAt).toLocaleDateString('es-AR')}
          </p>
        </div>

        <button onClick={toggleActive} className="btn btn-secondary" style={{ gap: '8px' }}>
          {form.isActive ? <ToggleRight size={18} color="#34d399" /> : <ToggleLeft size={18} color="#71717a" />}
          {form.isActive ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="login-error" style={{ marginBottom: '20px' }}>{error}</div>
      )}
      {success && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
          fontSize: '13px', color: '#34d399',
        }}>{success}</div>
      )}

      {/* Usage stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {statItems.map(s => (
          <div key={s.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <s.icon size={20} color={s.color} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Company Info */}
          <div className="card">
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#8b5cf6" /> Datos de la Empresa
            </h2>

            <div className="input-group">
              <label className="input-label">Razón Social</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Slug (URL)</label>
              <input className="input-field" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} style={{ fontFamily: 'monospace' }} required />
            </div>
            <div className="input-group">
              <label className="input-label"><Hash size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> CUIT</label>
              <input className="input-field" placeholder="30-12345678-9" value={form.cuit} onChange={e => setForm(f => ({ ...f, cuit: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label"><Mail size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Email</label>
                <input type="email" className="input-field" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label"><Phone size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Teléfono</label>
                <input className="input-field" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label"><MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Dirección</label>
              <input className="input-field" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">Plan</label>
              <select className="input-field" value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                {PLANS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Config & AFIP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="card">
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
                ⚙️ Configuración AFIP
              </h2>
              <div className="input-group">
                <label className="input-label">Punto de Venta AFIP</label>
                <input type="number" className="input-field" placeholder="Ej: 1" value={form.afipPuntoVenta} onChange={e => setForm(f => ({ ...f, afipPuntoVenta: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Entorno AFIP</label>
                <select className="input-field" value={form.afipEnvironment} onChange={e => setForm(f => ({ ...f, afipEnvironment: e.target.value }))}>
                  <option value="TESTING">Testing (Homologación)</option>
                  <option value="PRODUCTION">Producción</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Dirección Base Logística</label>
                <input className="input-field" placeholder="Av. Corrientes 1234, CABA" value={form.logisticBaseAddress} onChange={e => setForm(f => ({ ...f, logisticBaseAddress: e.target.value }))} />
              </div>
            </div>

            {/* Users Card */}
            <div className="card" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  👥 Usuarios ({tenant.users.length})
                </h2>
              </div>

              {tenant.users.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Sin usuarios asignados</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tenant.users.map(tu => (
                    <div key={tu.id} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 12px', borderRadius: '8px',
                      background: 'var(--bg-root)', border: '1px solid var(--border-color)',
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 600, color: 'white', flexShrink: 0,
                      }}>
                        {tu.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{tu.user.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tu.user.email}</div>
                      </div>
                      <span style={{
                        fontSize: '11px', fontWeight: 500, padding: '2px 8px',
                        borderRadius: '999px',
                        background: tu.role === 'ADMIN' ? 'rgba(139,92,246,0.1)' : 'rgba(99,102,241,0.08)',
                        color: tu.role === 'ADMIN' ? '#c4b5fd' : 'var(--color-primary-light)',
                      }}>
                        {ROLE_LABELS[tu.role] || tu.role}
                      </span>
                      {!tu.isActive && (
                        <span style={{ fontSize: '10px', color: '#f87171' }}>Inactivo</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', borderRadius: '12px',
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
        }}>
          <div>
            {!showDelete ? (
              <button type="button" onClick={() => setShowDelete(true)} className="btn btn-ghost" style={{ color: 'var(--color-danger)', gap: '8px' }}>
                <Trash2 size={16} /> Eliminar Importadora
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#f87171' }}>¿Confirmar eliminación?</span>
                <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm">
                  Sí, eliminar todo
                </button>
                <button type="button" onClick={() => setShowDelete(false)} className="btn btn-ghost btn-sm">
                  Cancelar
                </button>
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary" style={{ gap: '8px' }}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
