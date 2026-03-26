'use client';

import { useState } from 'react';
import { Building2, ChevronDown, ChevronUp, Shield, UserCheck } from 'lucide-react';

export default function ClientUserList({ tenants, unassignedUsers }: { tenants: any[], unassignedUsers: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {tenants.map((tenant) => {
        const isExpanded = expanded[tenant.id];

        return (
          <div key={tenant.id} style={{
            background: '#0f0f14', border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s'
          }}>
            <button 
              onClick={() => toggle(tenant.id)}
              style={{ 
                width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: isExpanded ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)', 
                border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building2 size={20} color="#7dd3fc" />
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa' }}>{tenant.name}</h2>
                  <div style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>{tenant.users.length} usuarios asignados</div>
                </div>
              </div>
              <div style={{ color: '#71717a' }}>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </button>

            {isExpanded && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {tenant.users.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#71717a', fontSize: '14px' }}>
                    No hay usuarios en esta importadora.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.02)', textAlign: 'left', fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>Usuario</th>
                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>Registro</th>
                        <th style={{ padding: '16px 24px', fontWeight: 600 }}>Rol Interno</th>
                        <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'center' }}>Plataforma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenant.users.map(({ user, role }: any) => (
                        <tr key={user.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s', ...({ '&:hover': { background: 'rgba(255,255,255,0.01)' } } as any) }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                                {user.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: 500, color: '#fafafa' }}>{user.name}</div>
                                <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                              {new Date(user.createdAt).toLocaleDateString('es-AR', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              fontSize: '11px', fontWeight: 500, padding: '4px 10px',
                              borderRadius: '999px', background: 'rgba(56, 189, 248, 0.1)', color: '#7dd3fc'
                            }}>
                              {role}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            {user.role === 'SUPER_ADMIN' ? (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                                borderRadius: '999px', background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd'
                              }}>
                                <Shield size={12} /> Super Admin
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                fontSize: '11px', fontWeight: 500, padding: '4px 10px',
                                borderRadius: '999px', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7'
                              }}>
                                <UserCheck size={12} /> Usuario Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}

      {unassignedUsers.length > 0 && (
        <div style={{
          background: '#0f0f14', border: '1px solid rgba(255, 169, 77, 0.2)',
          borderRadius: '16px', overflow: 'hidden', opacity: 0.8, marginTop: '16px'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255, 169, 77, 0.05)' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fafafa' }}>Usuarios Sin Asignar (De Plataforma)</h2>
            <div style={{ fontSize: '13px', color: '#71717a', marginTop: '2px' }}>Usuarios que no pertenecen a ninguna importadora.</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.02)', textAlign: 'left', fontSize: '12px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>Usuario</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600 }}>Registro</th>
                  <th style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'center' }}>Plataforma</th>
                </tr>
              </thead>
              <tbody>
                {unassignedUsers.map((user) => (
                  <tr key={user.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                          {user.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: '#fafafa' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                        {new Date(user.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      {user.role === 'SUPER_ADMIN' ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: 600, padding: '4px 10px',
                          borderRadius: '999px', background: 'rgba(139, 92, 246, 0.15)', color: '#c4b5fd'
                        }}>
                          <Shield size={12} /> Super Admin
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: 500, padding: '4px 10px',
                          borderRadius: '999px', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7'
                        }}>
                          <UserCheck size={12} /> Usuario Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </div>
  );
}
