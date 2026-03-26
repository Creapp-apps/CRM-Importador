'use client';

import dynamic from 'next/dynamic';

const PickLocationMap = dynamic(
  () => import('./LocationPicker'),
  { 
    ssr: false, 
    loading: () => (
      <div style={{ height: '300px', width: '100%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
        Cargando mapa...
      </div>
    ) 
  }
);

export default PickLocationMap;
