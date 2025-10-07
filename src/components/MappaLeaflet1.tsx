"use client";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useRef, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MappaLeafletProps {
  dati: any[];
  selected: { lat: number; lon: number; matricola: string } | null;
  coloriStato: Record<string, string>;
}

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

const normalizeMarkerColor = (c?: string) => {
  const aliases: Record<string, string> = { purple: "violet", gray: "grey" };
  const low = (c || "blue").toLowerCase();
  return aliases[low] || low;
};

const createIcon = (colore: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${colore}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

export default function MappaLeaflet1({
  dati,
  selected,
  coloriStato,
}: MappaLeafletProps) {
  const [query, setQuery] = useState("");

  const oggi = useMemo(() => new Date().toLocaleDateString("it-IT"), []);

  // 🔹 Filtra solo dati di oggi con coordinate
  const datiOggi = useMemo(
    () => dati.filter((r) => r.data === oggi && r.lat && r.lon),
    [dati, oggi]
  );

  // 🔍 Filtra per ricerca
  const filtrati = useMemo(
    () =>
      datiOggi.filter(
        (r) =>
          r.nominativo?.toLowerCase().includes(query.toLowerCase()) ||
          r.matricola?.toLowerCase().includes(query.toLowerCase())
      ),
    [datiOggi, query]
  );

  // 🔸 Calcola contatori dinamici
  const contatori = useMemo(() => {
    const count = {
      presente: 0,
      assente: 0,
      ferie: 0,
      malattia: 0,
      permesso: 0,
    };

    filtrati.forEach((r) => {
      let statoEff = (r.stato || "").toLowerCase();

      if (r.presenza) statoEff = "presente";
      else if (r.assenza) statoEff = "assente";
      else if (r.permessi && String(r.permessi).trim() !== "") statoEff = "permesso";
      else if (r.malattia) statoEff = "malattia";
      else if (r.ferie && String(r.ferie).includes("-")) {
        const [dal, al] = String(r.ferie).split("-").map((s) => s.trim());
        const oggiDate = new Date(oggi.split("/").reverse().join("-"));
        const start = new Date(dal);
        const end = new Date(al);
        if (oggiDate >= start && oggiDate <= end) statoEff = "ferie";
      }

      if (count.hasOwnProperty(statoEff)) {
        count[statoEff as keyof typeof count]++;
      }
    });

    return count;
  }, [filtrati, oggi]);

  const defaultPosition: [number, number] =
    filtrati.length > 0
      ? [filtrati[0].lat, filtrati[0].lon]
      : [41.9028, 12.4964]; // Roma

  const markerRefs = useRef<Record<string, L.Marker>>({});

  return (
    <div className="h-full w-full relative">
      {/* 🔍 Campo ricerca */}
      <input
        type="text"
        placeholder="Cerca dipendente per nome o matricola..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded shadow w-72"
      />

      {/* 🔸 Contatori dinamici */}
      <div className="absolute top-2 left-2 z-[1000] bg-white/90 backdrop-blur-md p-3 rounded shadow text-sm flex flex-col gap-1 w-56 border">
        <div className="flex justify-between items-center text-green-600 font-semibold">
          🟢 Presenti <span>{contatori.presente}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600 font-semibold">
          ⚪ Assenti <span>{contatori.assente}</span>
        </div>
        <div className="flex justify-between items-center text-yellow-500 font-semibold">
          🟡 Ferie <span>{contatori.ferie}</span>
        </div>
        <div className="flex justify-between items-center text-red-500 font-semibold">
          🔴 Malattia <span>{contatori.malattia}</span>
        </div>
        <div className="flex justify-between items-center text-blue-500 font-semibold">
          🔵 Permessi <span>{contatori.permesso}</span>
        </div>
      </div>

      {/* 🗺️ Mappa */}
      <MapContainer center={defaultPosition} zoom={12} className="h-full w-full">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filtrati.map((item, idx) => {
          let statoEff: string | undefined = item.stato;

          if (item.presenza) statoEff = "presente";
          else if (item.assenza) statoEff = "assente";
          else if (item.permessi && String(item.permessi).trim() !== "")
            statoEff = "permesso";
          else if (item.malattia) statoEff = "malattia";
          else if (item.ferie && String(item.ferie).includes("-")) {
            const [dal, al] = String(item.ferie)
              .split("-")
              .map((s) => s.trim());
            const oggiDate = new Date(oggi.split("/").reverse().join("-"));
            const start = new Date(dal);
            const end = new Date(al);
            if (oggiDate >= start && oggiDate <= end) statoEff = "ferie";
          }

          const colore = normalizeMarkerColor(
            coloriStato[statoEff || ""] || "blue"
          );

          return (
            <Marker
              key={item.matricola || idx}
              position={[item.lat, item.lon]}
              icon={createIcon(colore)}
              ref={(ref) => {
                if (ref && item.matricola)
                  markerRefs.current[item.matricola] = ref;
              }}
            >
              <Popup>
                <strong>{item.nominativo}</strong>
                <br />
                Data: {item.data}
                <br />
                Stato: {statoEff || "n/d"}
                <br />
                Matricola: {item.matricola}
                <br />
                Comune: {item.comune}
                <br />
                {item.permessi && statoEff === "permesso" && (
                  <>Tipo permesso: {item.permessi}</>
                )}
              </Popup>
            </Marker>
          );
        })}

        {selected && <CentraMarker selected={selected} markerRefs={markerRefs} />}
      </MapContainer>
    </div>
  );
}
