'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export default function LocationPicker({ 
  initialLat = -34.6037, // Default Buenos Aires
  initialLng = -58.3816, 
  onChange,
  readOnly = false
}: { 
  initialLat?: number; 
  initialLng?: number; 
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}) {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        if (readOnly || !onChange) return;
        setPosition([e.latlng.lat, e.latlng.lng]);
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });

    return position ? <Marker position={position} icon={icon} /> : null;
  }

  return (
    <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '8px', zIndex: 0 }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
      />
      <LocationMarker />
    </MapContainer>
  );
}
