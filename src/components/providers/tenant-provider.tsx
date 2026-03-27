'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface TenantContextType {
  tenantId: string | null;
  tenantName: string | null;
  tenantSlug: string | null;
  userRole: string | null;
  userName: string | null;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType>({
  tenantId: null,
  tenantName: null,
  tenantSlug: null,
  userRole: null,
  userName: null,
  isLoading: true,
});

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantProvider({ children, initialData }: { children: ReactNode; initialData?: Partial<TenantContextType> }) {
  const [data, setData] = useState<TenantContextType>({
    tenantId: initialData?.tenantId ?? null,
    tenantName: initialData?.tenantName ?? null,
    tenantSlug: initialData?.tenantSlug ?? null,
    userRole: initialData?.userRole ?? null,
    userName: initialData?.userName ?? null,
    isLoading: !initialData,
  });

  useEffect(() => {
    if (initialData) {
      setData({
        ...initialData,
        isLoading: false,
      } as TenantContextType);
    }
  }, [initialData]);

  return (
    <TenantContext.Provider value={data}>
      {children}
    </TenantContext.Provider>
  );
}
