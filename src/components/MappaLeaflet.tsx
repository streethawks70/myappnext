'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { useRef, useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import Routing from "./Routing";
import toast, { Toaster } from "react-hot-toast";

export type Posizione = {
  nome: string;
  lat: number;
  lng: number;
  stato: 'presente' | 'assente' | 'ferie' | 'malattia' | 'permessi';
  comune: string;
  matricola: string;
  direttore_lavori: string;
  chilometri_percorsi: string;
  data: string;
};

type Props = {
  posizioni: Posizione[];
  attivaClickPartenza: boolean;
  centraMappa?: { lat: number; lng: number } | null;
  mostraSidebar?: boolean;
  selezionato?: { nome: string } | null; // ✅ nuova prop per click esterno
};

// 🔹 Icone marker
const createIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

const iconPresente = createIcon('green');
const iconAssente = createIcon('grey');
const iconFerie = createIcon('yellow');
const iconMalattia = createIcon('red');
const iconPermessi = createIcon('blue');
const iconPartenza = createIcon('cyan');

export default function MappaLeaflet({
  posizioni,
  attivaClickPartenza,
  centraMappa,
  mostraSidebar = true,
  selezionato, // ✅ nuova prop
}: Props) {
  const [selezionatoInterno, setSelezionatoInterno] = useState<Posizione | null>(null);
  const [puntoPartenza, setPuntoPartenza] = useState<[number, number] | null>(null);
  const [distanzaKm, setDistanzaKm] = useState<number | null>(null);
  const mapRef = useRef<L.Map>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const notificatiRef = useRef<Set<string>>(new Set());
  const primaVoltaRef = useRef(true);

  // ✅ Notifica nuovi nominativi
  useEffect(() => {
    if (!posizioni || posizioni.length === 0) return;
    const keyOf = (p: Posizione) => `${p.nome}-${p.data ?? ""}`;

    if (primaVoltaRef.current) {
      posizioni.forEach(p => notificatiRef.current.add(keyOf(p)));
      primaVoltaRef.current = false;
      return;
    }

    const chiaviAttuali = new Set(posizioni.map(p => keyOf(p)));
    const nuovi = posizioni.filter(p => !notificatiRef.current.has(keyOf(p)));
    notificatiRef.current = chiaviAttuali;

    if (nuovi.length > 0) {
      nuovi.forEach(p => {
        toast.success(`🟢 Nuovo nominativo: ${p.nome}`, { duration: 4000 });
      });
    }
  }, [posizioni]);

  // ✅ Zoom sul nominativo selezionato interno
  useEffect(() => {
    if (selezionatoInterno && mapRef.current) {
      mapRef.current.setView([selezionatoInterno.lat, selezionatoInterno.lng], 14, { animate: true });
      const marker = markerRefs.current[selezionatoInterno.nome];
      if (marker) marker.openPopup();
    }
  }, [selezionatoInterno]);

  // ✅ Se arriva una selezione esterna (da sidebar principale)
  useEffect(() => {
    if (selezionato && mapRef.current) {
      const trovato = posizioni.find(p => p.nome === selezionato.nome);
      if (trovato) {
        setSelezionatoInterno(trovato);
        mapRef.current.setView([trovato.lat, trovato.lng], 14, { animate: true });
        const marker = markerRefs.current[trovato.nome];
        if (marker) marker.openPopup();
      }
    }
  }, [selezionato, posizioni]);

  useEffect(() => {
  if (!centraMappa || !mapRef.current) return;

  const map = mapRef.current;

  // Trova il marker corrispondente
  const marker = posizioni.find(
    (p) => p.lat === centraMappa.lat && p.lng === centraMappa.lng
  );

  if (!marker) return;

  // Centra la mappa
  map.flyTo([centraMappa.lat, centraMappa.lng], 14, { animate: true });

  // Apri popup sul marker
  const markerRef = markerRefs.current[marker.nome];
  if (markerRef) markerRef.openPopup();
}, [centraMappa, posizioni]);


  // ✅ Click per punto partenza
 useEffect(() => {
  if (!mapRef.current) return;

  const map = mapRef.current;

  const onClick = (e: L.LeafletMouseEvent) => {
    if (attivaClickPartenza) {
      setPuntoPartenza([e.latlng.lat, e.latlng.lng]);
    }
  };

  map.on("click", onClick);

  return () => {
    map.off("click", onClick);
  };
}, [attivaClickPartenza]);


  // ✅ Calcola distanza
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !puntoPartenza || !selezionatoInterno) {
      setDistanzaKm(null);
      return;
    }

    const dist = map.distance(
      L.latLng(puntoPartenza[0], puntoPartenza[1]),
      L.latLng(selezionatoInterno.lat, selezionatoInterno.lng)
    );
    const km = Number((dist / 1000).toFixed(2));
    setDistanzaKm(km);

    map.closePopup();
    L.popup({ autoClose: true, closeOnClick: true })
      .setLatLng([selezionatoInterno.lat, selezionatoInterno.lng])
      .setContent(`<div class="text-sm font-medium">Distanza dal punto di partenza: ${km} km</div>`)
      .openOn(map);
  }, [selezionatoInterno, puntoPartenza]);

  const scegliIcona = (stato: Posizione['stato']) => {
    switch (stato) {
      case 'presente': return iconPresente;
      case 'assente': return iconAssente;
      case 'ferie': return iconFerie;
      case 'malattia': return iconMalattia;
      case 'permessi': return iconPermessi;
      default: return iconAssente;
    }
  };

  return (
    <div className="flex h-full w-full">
      <Toaster position="top-right" reverseOrder={false} />

      {mostraSidebar && (
        <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-3">Nominativi</h2>
          <ul className="space-y-2">
            {posizioni.map((r) => (
              <li key={r.nome} className="border-b pb-2 mb-2">
                <button
                  onClick={() => setSelezionatoInterno(r)}
                  className="text-sm w-full text-left"
                >
                  <span className="font-bold">{r.nome}</span> <br />
                  Stato: {r.stato}<br />
                  Comune: {r.comune}<br />
                  Matricola: {r.matricola}<br />
                  Direttore lavori: {r.direttore_lavori}<br />
                  Km percorsi: {r.chilometri_percorsi}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex-1 relative">
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

          {puntoPartenza && (
            <Marker position={puntoPartenza} icon={iconPartenza}>
              <Popup>Punto di partenza</Popup>
            </Marker>
          )}

          {puntoPartenza && selezionatoInterno && (
            <Routing start={puntoPartenza} end={[selezionatoInterno.lat, selezionatoInterno.lng]} />
          )}

          {posizioni.map((r) => (
            <Marker
              key={r.nome}
              position={[r.lat, r.lng]}
              icon={scegliIcona(r.stato)}
              ref={(el) => { if (el) markerRefs.current[r.nome] = el; }}
            >
              <Popup>
                <div>
                  <strong>{r.nome}</strong> <br />
                  Stato: {r.stato}<br />
                  Comune: {r.comune}<br />
                  Matricola: {r.matricola}<br />
                  Direttore lavori: {r.direttore_lavori}<br />
                  Km percorsi: {r.chilometri_percorsi}
                </div>
              </Popup>
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
