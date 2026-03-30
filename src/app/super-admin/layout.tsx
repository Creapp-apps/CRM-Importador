import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SuperAdminSidebarClient from './sidebar-client';

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
    { href: '/super-admin', label: 'Panel', iconName: 'Home' },
    { href: '/super-admin/tenants', label: 'Importadoras', iconName: 'Building2' },
    { href: '/super-admin/users', label: 'Usuarios', iconName: 'Users' },
    { href: '/super-admin/stats', label: 'Estadísticas', iconName: 'BarChart3' },
    { href: '/super-admin/settings', label: 'Configuración', iconName: 'Settings' },
  ];

  return (
    <SuperAdminSidebarClient
      navItems={navItems}
      userName={session.user?.name || ''}
      userEmail={session.user?.email || ''}
    >
      {children}
    </SuperAdminSidebarClient>
  );
}
