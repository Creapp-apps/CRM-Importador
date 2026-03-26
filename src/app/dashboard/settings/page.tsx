'use client';

import { Settings, Building2, Users, Shield, Bell, Database } from 'lucide-react';
import { useTenant } from '@/components/providers/tenant-provider';

export default function SettingsPage() {
  const { tenantName, tenantSlug, userRole } = useTenant();

  const settingsSections = [
    {
      icon: <Building2 size={22} />,
      title: 'Datos de la Empresa',
      description: 'Razón social, CUIT, dirección, logo y datos fiscales.',
      color: '#6366f1',
    },
    {
      icon: <Users size={22} />,
      title: 'Usuarios y Roles',
      description: 'Gestionar usuarios del equipo, asignar roles y permisos.',
      color: '#06b6d4',
    },
    {
      icon: <Shield size={22} />,
      title: 'Facturación AFIP',
      description: 'Configuración de punto de venta, certificados y entorno de AFIP.',
      color: '#10b981',
    },
    {
      icon: <Bell size={22} />,
      title: 'Notificaciones',
      description: 'Alertas de stock bajo, pedidos nuevos y recordatorios de cobro.',
      color: '#f59e0b',
    },
    {
      icon: <Database size={22} />,
      title: 'Datos del Sistema',
      description: 'Unidades de medida, categorías de clientes y canales de venta.',
      color: '#ef4444',
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">
            {tenantName || 'Tu empresa'} — {tenantSlug || 'sin-slug'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {settingsSections.map((section) => (
          <div
            key={section.title}
            className="card"
            style={{ cursor: 'pointer', '--stat-color': section.color } as React.CSSProperties}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: `${section.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: section.color,
                  flexShrink: 0,
                }}
              >
                {section.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                  {section.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {section.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
