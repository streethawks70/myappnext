'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useRef, useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

export type Posizione = {
  nome: string;
  lat: number;
  lng: number;
  stato: 'presente' | 'assente' | 'ferie' | 'malattia' | 'permessi';
};

type Props = {
  posizioni: Posizione[];
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const iconVerde = new L.Icon({
  iconUrl: 'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=person|008000',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const iconRosso = new L.Icon({
  iconUrl: 'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=person|FF0000',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const iconGiallo = new L.Icon({
  iconUrl: 'https://chart.googleapis.com/chart?chst=d_map_pin_icon&chld=person|FFFF00',
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});




export default function MappaLeaflet({ posizioni }: Props) {
  const [selezionato, setSelezionato] = useState<Posizione | null>(null);
  const mapRef = useRef<L.Map>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  // Centra la mappa sulla posizione selezionata e apre il popup corrispondente
  useEffect(() => {
    if (selezionato && mapRef.current) {
      mapRef.current.setView([selezionato.lat, selezionato.lng], 14, { animate: true });
      
      // Apri il popup corrispondente
      const marker = markerRefs.current[selezionato.nome];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selezionato]);

  const scegliIcona = (stato: Posizione['stato']) => {
    
    switch (stato) {
      case 'presente':
      case 'ferie':
        return iconVerde;
      case 'assente':
      case 'malattia':
        return iconRosso;
      case 'permessi':
        return iconGiallo;
      default:
        return new L.Icon.Default();
    }
    
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Nominativi</h2>
        <ul className="space-y-2">
          {posizioni.map((r) => (
            <li key={r.nome}>
              <button
                onClick={() => setSelezionato(r)}
                className="text-sm text-blue-600 hover:underline w-full text-left"
              >
                {r.nome} ({r.stato})
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1">
        <MapContainer
          center={[41.9, 12.5]}
          zoom={6}
          className="h-full w-full"
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          {posizioni.map((r) => (
            <Marker
              key={r.nome}
              position={[r.lat, r.lng]}
              icon={scegliIcona(r.stato)}
              ref={(el) => {
                if (el) markerRefs.current[r.nome] = el;
              }}
            >
              <Popup>{r.nome}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
