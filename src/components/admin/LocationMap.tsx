'use client';
/** Mapa Leaflet (carregar só no cliente via next/dynamic com ssr:false). */
import 'leaflet/dist/leaflet.css';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';

export default function LocationMap({ lat, lng, label }: { lat: number; lng: number; label?: string }) {
  return (
    <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} style={{ height: 260, width: '100%', borderRadius: 12 }}>
      <TileLayer attribution='© OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: '#0a2942', fillColor: '#c99a40', fillOpacity: 0.9 }}>
        {label && <Popup>{label}</Popup>}
      </CircleMarker>
    </MapContainer>
  );
}