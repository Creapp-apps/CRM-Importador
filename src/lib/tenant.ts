import { prisma } from "./prisma";
import { auth } from "./auth";
import { UserRole } from ".prisma/client";

export async function getCurrentTenantUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const tenantUser = await prisma.tenantUser.findFirst({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      tenant: true,
      user: true,
    },
  });

  return tenantUser;
}

export async function getTenantId(): Promise<string | null> {
  const tenantUser = await getCurrentTenantUser();
  return tenantUser?.tenantId ?? null;
}

export async function requireTenantUser() {
  const tenantUser = await getCurrentTenantUser();
  if (!tenantUser) {
    throw new Error("Not authenticated or no tenant access");
  }
  return tenantUser;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const tenantUser = await requireTenantUser();
  if (!allowedRoles.includes(tenantUser.role)) {
    throw new Error("Insufficient permissions");
  }
  return tenantUser;
}

export function hasPermission(role: UserRole, action: string): boolean {
  const permissions: Record<string, UserRole[]> = {
    // Inventory
    "inventory:read": ["ADMIN", "VENDEDOR", "DEPOSITO", "REPARTIDOR"],
    "inventory:write": ["ADMIN", "DEPOSITO"],
    "inventory:delete": ["ADMIN"],
    "inventory:adjust": ["ADMIN", "DEPOSITO"],

    // Customers
    "customers:read": ["ADMIN", "VENDEDOR", "DEPOSITO"],
    "customers:write": ["ADMIN", "VENDEDOR"],
    "customers:delete": ["ADMIN"],

    // Orders
    "orders:read": ["ADMIN", "VENDEDOR", "DEPOSITO", "REPARTIDOR"],
    "orders:write": ["ADMIN", "VENDEDOR"],
    "orders:delete": ["ADMIN"],

    // Delivery
    "delivery:read": ["ADMIN", "DEPOSITO", "REPARTIDOR"],
    "delivery:write": ["ADMIN", "DEPOSITO"],
    "delivery:update_status": ["ADMIN", "DEPOSITO", "REPARTIDOR"],

    // Settings
    "settings:read": ["ADMIN"],
    "settings:write": ["ADMIN"],

    // Price rules
    "prices:read": ["ADMIN", "VENDEDOR"],
    "prices:write": ["ADMIN"],

    // Reports
    "reports:read": ["ADMIN", "VENDEDOR"],
    "reports:export": ["ADMIN"],
  };

  const rolesForAction = permissions[action];
  if (!rolesForAction) return false;
  return rolesForAction.includes(role);
}
