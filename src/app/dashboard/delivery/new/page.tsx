'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Box } from 'lucide-react';
import Link from 'next/link';

export default function NewDeliveryRoutePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    assignedUserId: '',
    vehicleInfo: '',
    notes: '',
  });

  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/orders').then(r => r.json()),
    ]).then(([userData, orderData]) => {
      if (Array.isArray(userData)) setUsers(userData);
      if (Array.isArray(orderData)) {
        // Filter orders that are ready to be routed
        setOrders(orderData.filter(o => ['CONFIRMED', 'PREPARING', 'READY'].includes(o.status)));
      }
    }).catch(console.error);
  }, []);

  function toggleOrder(id: string) {
    const next = new Set(selectedOrderIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrderIds(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (selectedOrderIds.size === 0) {
      setError('Debes seleccionar al menos un pedido para la hoja de ruta');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/logistics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          orderIds: Array.from(selectedOrderIds),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al crear hoja de ruta');
      }

      router.push('/dashboard/delivery');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear hoja de ruta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/dashboard/delivery" className="btn btn-ghost btn-icon">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="page-title">Nueva Hoja de Ruta</h1>
          <p className="page-subtitle">Armar reparto y asignar transporte</p>
        </div>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2 className="card-title">Selección de Pedidos</h2>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Seleccioná los pedidos que formarán parte de este reparto. Solo se muestran los pedidos confirmados o en preparación.
            </p>

            {orders.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <Box size={24} style={{ color: 'var(--text-muted)' }} />
                <p style={{ marginTop: '12px', fontSize: '14px' }}>No hay pedidos confirmados o listos para despachar.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {orders.map(order => (
                  <label
                    key={order.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '16px', borderRadius: 'var(--radius-md)',
                      background: selectedOrderIds.has(order.id) ? 'rgba(139, 92, 246, 0.05)' : 'var(--bg-surface)',
                      border: `1px solid ${selectedOrderIds.has(order.id) ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.has(order.id)}
                      onChange={() => toggleOrder(order.id)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                    />
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>
                          {order.orderNumber}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          Cliente: {order.customer?.tradeName || order.customer?.businessName}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          ${Number(order.total).toLocaleString('es-AR')}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {order.items?.length || 0} items
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ width: '400px' }}>
          <div className="card" style={{ position: 'sticky', top: '24px' }}>
            <div className="card-header">
              <h2 className="card-title">Configuración del Reparto</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Fecha Programada *</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Repartidor / Responsable</label>
                <select
                  className="input-field"
                  value={form.assignedUserId}
                  onChange={e => setForm(f => ({ ...f, assignedUserId: e.target.value }))}
                >
                  <option value="">No asignado (Reparto de terceros)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.tenants[0]?.role})</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Vehículo / Logística</label>
                <input
                  className="input-field"
                  placeholder="Ej: Camioneta AA123BB, Flete externo..."
                  value={form.vehicleInfo}
                  onChange={e => setForm(f => ({ ...f, vehicleInfo: e.target.value }))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>Ej: Camioneta patente AA123BB. Sirve para trazabilidad logística.</span>
              </div>

              <div className="input-group">
                <label className="input-label">Notas Adicionales</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Instrucciones para el repartidor..."
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{
                marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Pedidos seleccionados</span>
                <span className="badge badge-primary">{selectedOrderIds.size}</span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }} disabled={loading}>
                {loading ? 'Generando...' : 'Confirmar Hoja de Ruta'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
