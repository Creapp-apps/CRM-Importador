import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, BarChart3, Settings, LogOut, Shield, Home } from 'lucide-react';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isSuperAdmin = (session?.user as any)?.isSuperAdmin;

  if (!session || !isSuperAdmin) {
    redirect('/login');
  }

  const navItems = [
    { href: '/super-admin', label: 'Panel', icon: Home },
    { href: '/super-admin/tenants', label: 'Importadoras', icon: Building2 },
    { href: '/super-admin/users', label: 'Usuarios', icon: Users },
    { href: '/super-admin/stats', label: 'Estadísticas', icon: BarChart3 },
    { href: '/super-admin/settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-root)' }}>
      {/* Super Admin Sidebar */}
      <aside style={{
        width: '260px',
        background: '#080810',
        borderRight: '1px solid rgba(139, 92, 246, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 50,
      }}>
        {/* Brand */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Shield size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#fafafa' }}>Super Admin</div>
            <div style={{ fontSize: '11px', color: '#8b5cf6' }}>CreAPP Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#a1a1aa',
                textDecoration: 'none',
                transition: 'all 150ms',
                marginBottom: '2px',
              }}
              className="super-admin-nav-item"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(139, 92, 246, 0.1)' }}>
          <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', color: '#fafafa', fontWeight: 500 }}>
              {session.user?.name}
            </div>
            <div style={{ fontSize: '11px', color: '#71717a' }}>{session.user?.email}</div>
          </div>
          <Link
            href="/api/auth/signout"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#ef4444',
              textDecoration: 'none',
            }}
          >
            <LogOut size={16} />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        marginLeft: '260px',
        flex: 1,
        minHeight: '100vh',
        minWidth: 0,
      }}>
        <div style={{ padding: '32px', maxWidth: '1400px', width: '100%' }}>
          {children}
        </div>
      </main>

      <style>{`
        .super-admin-nav-item:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #c4b5fd;
        }
      `}</style>
    </div>
  );
}
