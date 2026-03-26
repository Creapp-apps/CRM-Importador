import { prisma } from '@/lib/prisma';
import { Search } from 'lucide-react';
import ClientUserList from './ClientUserList';

export default async function SuperAdminUsersPage() {
  const tenants = await prisma.tenant.findMany({
    include: {
      users: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: { name: 'asc' },
  });

  const unassignedUsers = await prisma.user.findMany({
    where: { tenants: { none: {} } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#fafafa', letterSpacing: '-0.3px' }}>
            Base de Usuarios Global
          </h1>
          <p style={{ fontSize: '14px', color: '#71717a', marginTop: '4px' }}>
            Usuarios desglosados por Importadora registrada.
          </p>
        </div>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#71717a' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por email o nombre..."
            style={{ paddingLeft: '36px', background: '#0f0f14', border: '1px solid rgba(255,255,255,0.06)' }}
          />
        </div>
      </div>

      <ClientUserList tenants={tenants} unassignedUsers={unassignedUsers} />
    </div>
  );
}
