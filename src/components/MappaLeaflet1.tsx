'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MappaLeafletProps {
  dati: any[];
  selected: { lat: number; lon: number; matricola: string } | null;
  coloriStato: Record<string, string>; 
  // es: { ferie:'yellow', malattia:'red', assente:'black', permesso:'purple', presente:'green' }
}

// centra e apre il popup del marker selezionato
function CentraMarker({
  selected,
  markerRefs,
}: {
  selected: { lat: number; lon: number; matricola: string } | null;
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}) {
  const map = useMap();
  useEffect(() => {
    if (!selected) return;
    map.setView([selected.lat, selected.lon], 15);
    const mk = markerRefs.current[selected.matricola];
    if (mk) mk.openPopup();
  }, [selected, map, markerRefs]);
  return null;
}

// alias per i nomi colore del set "leaflet-color-markers"
const normalizeMarkerColor = (c?: string) => {
  const aliases: Record<string, string> = {
    purple: 'violet',
    gray: 'grey',
  };
  const low = (c || 'blue').toLowerCase();
  return aliases[low] || low;
};

// crea icona colorata
const createIcon = (colore: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${colore}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

export default function MappaLeaflet1({ dati, selected, coloriStato }: MappaLeafletProps) {
  // data odierna come nel foglio: "gg/mm/aaaa"
  const oggi = useMemo(() => new Date().toLocaleDateString('it-IT'), []);

  // filtra solo le righe con la data odierna
  const datiOggi = useMemo(
    () => dati.filter((r) => r.data === oggi && r.lat && r.lon),
    [dati, oggi]
  );

  // posizione iniziale
  const defaultPosition: [number, number] =
    datiOggi.length > 0 ? [datiOggi[0].lat, datiOggi[0].lon] : [41.9028, 12.4964]; // Roma centro

  // ref per popup
  const markerRefs = useRef<Record<string, L.Marker>>({});

  return (
    <MapContainer center={defaultPosition} zoom={12} className="h-full w-full">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {datiOggi.map((item, idx) => {
        let statoEff: string | undefined = item.stato;

        // regole sugli stati
        if (item.presenza) {
          statoEff = 'presente';
        } else if (item.assenza) {
          statoEff = 'assente';
        } else if (item.permessi && String(item.permessi).trim() !== '') {
          statoEff = 'permessi';
        } else if (item.ferie && String(item.ferie).includes('-')) {
          // ferie tipo "2025-02-01 - 2025-02-05"
          const [dal, al] = String(item.ferie).split('-').map((s) => s.trim());
          const oggiDate = new Date(oggi.split('/').reverse().join('-')); // da "gg/mm/aaaa" → "aaaa-mm-gg"
          const start = new Date(dal);
          const end = new Date(al);
          if (oggiDate >= start && oggiDate <= end) {
            statoEff = 'ferie';
          }
        }

        const colore = normalizeMarkerColor(coloriStato[statoEff || ''] || 'blue');

        return (
          <Marker
            key={item.matricola || idx}
            position={[item.lat, item.lon]}
            icon={createIcon(colore)}
            ref={(ref) => {
              if (ref && item.matricola) markerRefs.current[item.matricola] = ref;
            }}
          >
            <Popup>
              <strong>{item.nominativo}</strong>
              <br />
              Stato: {statoEff || 'n/d'}
              <br />
              Matricola: {item.matricola}
              <br />
              Comune:{item.comune}
              <br/>
              {item.permessi && statoEff === 'permesso' && (
                <>Tipo permesso: {item.permessi}</>
              )}
            </Popup>
          </Marker>
        );
      })}

      {selected && <CentraMarker selected={selected} markerRefs={markerRefs} />}
    </MapContainer>
  );
}
