'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const baseIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function RouteMap({
  baseLat,
  baseLng,
  stops
}: {
  baseLat?: number | null;
  baseLng?: number | null;
  stops: { lat: number; lng: number; name: string; sequence: number; address: string }[];
}) {
  const centerLat = baseLat || (stops.length > 0 ? stops[0].lat : -34.6037);
  const centerLng = baseLng || (stops.length > 0 ? stops[0].lng : -58.3816);

  const validStops = stops.filter(s => s.lat && s.lng).sort((a,b) => a.sequence - b.sequence);
  const points: [number, number][] = [];
  
  if (baseLat && baseLng) {
    points.push([baseLat, baseLng]);
  }
  validStops.forEach(s => points.push([s.lat, s.lng]));

  return (
    <MapContainer center={[centerLat, centerLng]} zoom={12} style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 0 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />
      {baseLat && baseLng && (
        <Marker position={[baseLat, baseLng]} icon={baseIcon}>
           <Popup><strong>Punto de Partida</strong><br/>Fábrica / Depósito</Popup>
        </Marker>
      )}
      {validStops.map((stop, i) => (
        <Marker key={i} position={[stop.lat, stop.lng]} icon={defaultIcon}>
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'inline-block', background: 'var(--color-primary)', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '11px', marginBottom: '4px' }}>
                PARADA {stop.sequence}
              </span>
              <br/>
              <strong>{stop.name}</strong><br/>
              <span style={{ fontSize: '12px' }}>{stop.address}</span>
            </div>
          </Popup>
        </Marker>
      ))}
      {points.length > 1 && (
        <Polyline positions={points} color="#4f46e5" weight={4} opacity={0.6} dashArray="10, 10" />
      )}
    </MapContainer>
  );
}
