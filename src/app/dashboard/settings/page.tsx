import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import SettingsForm from './settings-form';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) return redirect('/login');
  
  // Only ADMIN should access settings
  if (tenantUser.role !== 'ADMIN') {
    return (
      <div className="animate-fade-in card p-8 text-center text-secondary">
        <h2>Acceso Denegado</h2>
        <p>Solamente los administradores pueden modificar la configuración del sistema.</p>
      </div>
    );
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantUser.tenantId },
  });

  if (!tenant) return notFound();

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Configuración del Sistema</h1>
        <p className="page-subtitle">Administrá las preferencias de tu importadora y datos operativos.</p>
      </div>

      <SettingsForm initialData={tenant} />
    </div>
  );
}
