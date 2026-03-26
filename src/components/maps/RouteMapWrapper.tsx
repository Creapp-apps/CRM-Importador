'use client';

import dynamic from 'next/dynamic';

const RouteMap = dynamic(
  () => import('./RouteMap'),
  { 
    ssr: false, 
    loading: () => (
      <div style={{ height: '400px', width: '100%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
        Renderizando ruta geográfica...
      </div>
    ) 
  }
);

export default RouteMap;
