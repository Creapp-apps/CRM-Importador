import { DollarSign, Plus, Power } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentTenantUser } from '@/lib/tenant';
import { notFound } from 'next/navigation';

export default async function PromotionsPage() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) return notFound();

  const promotions = await prisma.promotion.findMany({
    where: { tenantId: tenantUser.tenantId },
    orderBy: [{ validUntil: "desc" }],
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Promociones</h1>
          <p className="page-subtitle">Descuentos por volumen, campañas especiales y combinaciones</p>
        </div>
        <Link href="/dashboard/promotions/new" className="btn btn-primary">
          <Plus size={18} />
          Nueva Promoción
        </Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {promotions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <DollarSign size={28} style={{ color: '#10b981' }} />
            </div>
            <h3 className="empty-state-title">Sin promociones activas</h3>
            <p className="empty-state-desc">
              Creá promociones con descuento por volumen, por categoría de cliente, o campañas por fecha.
            </p>
            <Link href="/dashboard/promotions/new" className="btn btn-primary">
              <Plus size={18} />
              Crear Promoción
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Campaña</th>
                  <th>Tipo y Valor</th>
                  <th>Condición Mínima</th>
                  <th>Alcance</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => {
                  let conditionStr = "Sin Mínimos";
                  if (promo.minQuantity && promo.minAmount) conditionStr = `Mín: ${promo.minQuantity} u / $${Number(promo.minAmount).toLocaleString()}`;
                  else if (promo.minQuantity) conditionStr = `Mín: ${promo.minQuantity} u`;
                  else if (promo.minAmount) conditionStr = `Min: $${Number(promo.minAmount).toLocaleString()}`;

                  let scopeStr = "Todo el catálogo";
                  if (!promo.appliesToAll) {
                    if (promo.categoryIds.length > 0 && promo.productIds.length > 0) scopeStr = "Categ. + Específicos";
                    else if (promo.categoryIds.length > 0) scopeStr = "Solo Categorías ($)";
                    else if (promo.productIds.length > 0) scopeStr = "Productos Específicos";
                  }

                  let typeStr = "";
                  switch(promo.type) {
                    case "PERCENTAGE_OFF": typeStr = `${promo.value}% OFF`; break;
                    case "FIXED_DISCOUNT": typeStr = `-${Number(promo.value)} OFF ($)`; break;
                    case "BUY_X_GET_Y": typeStr = `Llevás x Pagás ${promo.value}`; break; // simplification
                    case "VOLUME_DISCOUNT": typeStr = `Dto Volumen ${promo.value}%`; break;
                  }

                  const isActive = promo.isActive && new Date(promo.validUntil) >= new Date();

                  return (
                    <tr key={promo.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{promo.name}</div>
                        {promo.description && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{promo.description}</div>}
                      </td>
                      <td style={{ fontWeight: 600, color: '#10b981' }}>{typeStr}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{conditionStr}</td>
                      <td>{scopeStr}</td>
                      <td>
                        {new Date(promo.validUntil).toLocaleDateString()}
                      </td>
                      <td>
                        {isActive ? (
                          <span className="badge badge-success">Activa</span>
                        ) : (
                          <span className="badge badge-error">Vencida/Pausada</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Pausar Promoción">
                          <Power size={16} />
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
