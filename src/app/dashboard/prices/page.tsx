import { Tag, Plus, Settings } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function PricesPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) return notFound();

  const rules = await prisma.priceRule.findMany({
    where: { tenantId: tenantUser.tenantId },
    include: {
      customer: { select: { tradeName: true, businessName: true } },
      category: { select: { name: true } },
      product: { select: { name: true, sku: true } },
      presentation: { select: { name: true } },
    },
    orderBy: [{ priority: "desc" }, { validFrom: "desc" }],
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Motor de Precios</h1>
          <p className="page-subtitle">Reglas de precios por cliente, categoría y producto</p>
        </div>
        <Link href="/dashboard/prices/new" className="btn btn-primary">
          <Plus size={18} />
          Nueva Regla
        </Link>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginBottom: '24px', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Tag size={20} style={{ color: 'var(--color-primary-light)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              Cómo funciona el motor de precios
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Las reglas se aplican por su <strong>Prioridad</strong>. A mayor prioridad (ej: 10 vs 0), mayor peso tiene la regla.
              <br/>Podés definir precios fijos, descuentos porcentuales (%) o markups (recargos) para cada combinación.
            </p>
          </div>
        </div>
      </div>

      {/* Rules Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {rules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Tag size={28} />
            </div>
            <h3 className="empty-state-title">Sin reglas de precio</h3>
            <p className="empty-state-desc">
              Definí reglas de precios preferenciales por cliente o categoría para automatizar la facturación.
            </p>
            <Link href="/dashboard/prices/new" className="btn btn-primary">
              <Plus size={18} />
              Crear Regla
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre de Regla</th>
                  <th>Aplica A (Cliente)</th>
                  <th>Aplica A (Prod)</th>
                  <th>Modificador</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => {
                  let appliesToCustomer = "Todos";
                  if (rule.customerId && rule.customer) appliesToCustomer = `Cliente: ${rule.customer.tradeName || rule.customer.businessName}`;
                  else if (rule.customerCategoryId && rule.category) appliesToCustomer = `Categoría: ${rule.category.name}`;

                  let appliesToProduct = "Todos";
                  if (rule.productId && rule.product) appliesToProduct = `Prod: ${rule.product.name}`;

                  let modifierStr = "";
                  switch(rule.ruleType) {
                    case "FIXED_PRICE": modifierStr = `Precio Fijo $${Number(rule.value).toLocaleString('es-AR')}`; break;
                    case "PERCENTAGE_OFF": modifierStr = `${rule.value}% OUT`; break;
                    case "FIXED_DISCOUNT": modifierStr = `-${Number(rule.value)} OFF`; break;
                    case "MARKUP": modifierStr = `+${rule.value}% Recargo`; break;
                  }

                  const isActive = rule.isActive && (!rule.validUntil || new Date(rule.validUntil) >= new Date());

                  return (
                    <tr key={rule.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rule.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Desde: {new Date(rule.validFrom).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ color: rule.customerId ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>
                        {appliesToCustomer}
                      </td>
                      <td style={{ color: rule.productId ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>
                        {appliesToProduct}
                      </td>
                      <td style={{ fontWeight: 600 }}>{modifierStr}</td>
                      <td>
                        <span className="badge badge-secondary">Prio: {rule.priority}</span>
                      </td>
                      <td>
                        {isActive ? (
                          <span className="badge badge-success">Activa</span>
                        ) : (
                          <span className="badge badge-error">Inactiva/Vencida</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Desactivar / Editar">
                          <Settings size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
