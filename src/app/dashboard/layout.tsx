import { SessionProvider } from 'next-auth/react';
import { TenantProvider } from '@/components/providers/tenant-provider';
import Sidebar from '@/components/dashboard/sidebar';
import { getCurrentTenantUser } from '@/lib/tenant';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard: Super Admin should never land in the tenant dashboard
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((session?.user as any)?.isSuperAdmin === true) {
    redirect('/super-admin');
  }

  let tenantData: {
    tenantId: string | null;
    tenantName: string | null;
    tenantSlug: string | null;
    userRole: string | null;
    userName: string | null;
  } = {
    tenantId: null,
    tenantName: null,
    tenantSlug: null,
    userRole: null,
    userName: null,
  };

  try {
    const tenantUser = await getCurrentTenantUser();
    if (!tenantUser) {
      redirect('/login');
    }

    tenantData = {
      tenantId: tenantUser.tenantId,
      tenantName: tenantUser.tenant.name,
      tenantSlug: tenantUser.tenant.slug,
      userRole: tenantUser.role,
      userName: tenantUser.user.name,
    };
  } catch {
    // If no session, middleware will redirect
  }

  return (
    <SessionProvider>
      <TenantProvider initialData={tenantData}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main className="main-content">
            <div className="main-body">{children}</div>
          </main>
        </div>
      </TenantProvider>
    </SessionProvider>
  );
}
