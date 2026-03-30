'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Building2, Users, BarChart3, Settings, Shield, Home,
  LogOut, Sun, Moon,
} from 'lucide-react';
import { useTheme } from '@/components/providers/theme-provider';

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Home, Building2, Users, BarChart3, Settings,
};

interface Props {
  navItems: { href: string; label: string; iconName: string }[];
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export default function SuperAdminSidebarClient({ navItems, userName, userEmail, children }: Props) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-root)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
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
          borderBottom: '1px solid var(--border-color)',
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
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Super Admin</div>
            <div style={{ fontSize: '11px', color: '#8b5cf6' }}>CreAPP Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
          {navItems.map(({ href, label, iconName }) => {
            const Icon = iconMap[iconName] || Home;
            const isActive = pathname === href || (href !== '/super-admin' && pathname.startsWith(href));
            return (
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
                  color: isActive ? 'var(--color-primary-light)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  background: isActive ? 'var(--sidebar-item-active)' : 'transparent',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all 150ms',
                  marginBottom: '2px',
                }}
                className="super-admin-nav-item"
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>
          {/* Theme toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={{ width: '100%', justifyContent: 'center', marginBottom: '12px' }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </button>

          {/* User info */}
          <div style={{ padding: '10px 12px', marginBottom: '4px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
              {userName}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{userEmail}</div>
          </div>

          {/* Logout */}
          <button
            className="sidebar-logout-btn"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
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
          background: var(--sidebar-item-hover);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
