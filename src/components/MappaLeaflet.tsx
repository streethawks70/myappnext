'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { useRef, useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

export type Posizione = {
  nome: string;
  lat: number;
  lng: number;
  stato: 'presente' | 'assente' | 'ferie' | 'malattia' | 'permessi';
  comune: string;
};

type Props = {
  posizioni: Posizione[];
};

// 🔹 Icone per marker
const iconPresente = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconAssente = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconFerie = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconMalattia = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const iconPermessi = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function MappaLeaflet({ posizioni }: Props) {
  const [selezionato, setSelezionato] = useState<Posizione | null>(null);
  const mapRef = useRef<L.Map>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (selezionato && mapRef.current) {
      mapRef.current.setView([selezionato.lat, selezionato.lng], 14, { animate: true });
      const marker = markerRefs.current[selezionato.nome];
      if (marker) marker.openPopup();
    }
  }, [selezionato]);

  const scegliIcona = (stato: Posizione['stato']) => {
    switch (stato) {
      case 'presente':
        return iconPresente;
      case 'assente':
        return iconAssente;
      case 'ferie':
        return iconFerie;
      case 'malattia':
        return iconMalattia;
      case 'permessi':
        return iconPermessi;
      default:
        return iconAssente;
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-3">Nominativi</h2>
        <ul className="space-y-2">
          {posizioni.map((r) => (
            <li key={r.nome}>
              <button
                onClick={() => setSelezionato(r)}
                className="text-sm text-blue-600 hover:underline w-full text-left"
              >
                {r.nome} ({r.stato}) – {r.comune}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Mappa */}
      <div className="flex-1">
        <MapContainer center={[41.9, 12.5]} zoom={6} className="h-full w-full" ref={mapRef}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles © Esri"
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="Topografica">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution="&copy; OpenStreetMap & CARTO"
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {posizioni.map((r) => (
            <Marker
              key={r.nome}
              position={[r.lat, r.lng]}
              icon={scegliIcona(r.stato)}
              ref={(el) => {
                if (el) markerRefs.current[r.nome] = el;
              }}
            >
              <Popup>
                {r.nome} ({r.stato}) – {r.comune}
              </Popup>
              {/* 🔹 Tooltip con coordinate */}
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
