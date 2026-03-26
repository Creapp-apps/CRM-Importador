'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Truck,
  Settings,
  LogOut,
  BarChart3,
  Tag,
  DollarSign,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useTenant } from '@/components/providers/tenant-provider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  // Inventario
  { label: 'Productos', href: '/dashboard/products', icon: <Package size={20} />, section: 'Inventario' },
  { label: 'Stock', href: '/dashboard/stock', icon: <BarChart3 size={20} /> },
  // CRM
  { label: 'Clientes', href: '/dashboard/customers', icon: <Users size={20} />, section: 'Comercial' },
  { label: 'Precios', href: '/dashboard/prices', icon: <Tag size={20} /> },
  { label: 'Promociones', href: '/dashboard/promotions', icon: <DollarSign size={20} /> },
  // Ventas
  { label: 'Pedidos', href: '/dashboard/orders', icon: <ShoppingCart size={20} />, section: 'Ventas' },
  { label: 'Facturación', href: '/dashboard/invoices', icon: <FileText size={20} /> },
  // Logística
  { label: 'Repartos', href: '/dashboard/delivery', icon: <Truck size={20} />, section: 'Logística' },
  // Config
  { label: 'Configuración', href: '/dashboard/settings', icon: <Settings size={20} />, section: 'Sistema' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { tenantName, userName, userRole } = useTenant();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrador',
    VENDEDOR: 'Vendedor',
    DEPOSITO: 'Depósito',
    REPARTIDOR: 'Repartidor',
  };

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GI';

  let currentSection = '';

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 60,
          display: 'none',
        }}
        id="mobile-menu-toggle"
      >
        <Menu size={20} />
      </button>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-toggle { display: flex !important; }
        }
      `}</style>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={collapsed ? { width: 'var(--sidebar-collapsed-width)' } : {}}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">GI</div>
          {!collapsed && (
            <span className="sidebar-brand-text">
              {tenantName || 'Gestor Interno'}
            </span>
          )}
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginLeft: 'auto', display: collapsed ? 'none' : 'flex' }}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            <ChevronLeft size={16} style={{ transition: 'transform 0.2s', transform: collapsed ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const showSection = item.section && item.section !== currentSection;
            if (item.section) currentSection = item.section;

            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <div key={item.href}>
                {showSection && !collapsed && (
                  <div className="sidebar-section-title">{item.section}</div>
                )}
                <Link
                  href={item.href}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  {!collapsed && item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer with user */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{userName || 'Usuario'}</div>
                <div className="sidebar-user-role">
                  {userRole ? roleLabels[userRole] || userRole : 'Sin rol'}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => signOut({ callbackUrl: '/login' })}
                title="Cerrar sesión"
                style={{ marginLeft: 'auto' }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
