'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MappaLeaflet1Props {
  dati: { nominativo: string; lat?: number; lon?: number; matricola: string }[];
  selected?: { lat: number; lon: number; matricola: string } | null;
}

function FlyToSelected({
  selected,
  markerRefs,
}: {
  selected?: { lat: number; lon: number; matricola: string } | null;
  markerRefs: React.MutableRefObject<{ [key: string]: L.Marker }>;
}) {
  const map = useMap();

  useEffect(() => {
    if (selected) {
      const marker = markerRefs.current[selected.matricola];
      if (marker) {
        map.setView([selected.lat, selected.lon], 14, { animate: true });
        marker.openPopup(); // popup si apre correttamente
      }
    }
  }, [selected, map, markerRefs]);

  return null;
}

export default function MappaLeaflet1({ dati, selected }: MappaLeaflet1Props) {
  const validData = dati.filter((d) => d.lat && d.lon);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});

  if (validData.length === 0) {
    return <p className="text-center text-gray-500">📍 Nessuna posizione disponibile</p>;
  }

  const center: [number, number] = [
    validData.reduce((sum, d) => sum + (d.lat || 0), 0) / validData.length,
    validData.reduce((sum, d) => sum + (d.lon || 0), 0) / validData.length,
  ];

  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validData.map((item) => (
        <Marker
          key={item.matricola}
          position={[item.lat!, item.lon!]}
          icon={icon}
          eventHandlers={{
            add: (e) => {
              // salva il marker in ref
              markerRefs.current[item.matricola] = e.target;
            },
          }}
        >
          <Popup>{item.nominativo}</Popup>
        </Marker>
      ))}
      <FlyToSelected selected={selected} markerRefs={markerRefs} />
    </MapContainer>
  );
}
