"use client";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PosizioneReplay } from "./ReplayLeaflet";

// 🔹 Icone senza dipendere da /public
const BlueIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RedIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  posizioni: PosizioneReplay[];
};

export default function MappaLeafletReplay({ posizioni }: Props) {
  const [markerCorrenteIndex, setMarkerCorrenteIndex] = useState<number | null>(null);

  const punti = posizioni.map((p) => [p.lat, p.lng] as [number, number]);
  const colors = posizioni.map((p) => (p.tipo === "ingresso" ? "blue" : "red"));

  const center: [number, number] = punti[0] || [45.4642, 9.19]; // default Milano

  return (
    <div className="flex h-[600px]">
      {/* Sidebar scrollabile e cliccabile */}
      <div className="w-40 border-r p-2 overflow-y-auto">
        {posizioni.map((p, idx) => (
          <div
            key={idx}
            className={`mb-1 p-1 rounded cursor-pointer ${
              markerCorrenteIndex === idx ? "bg-gray-300" : "hover:bg-gray-200"
            }`}
            onClick={() => setMarkerCorrenteIndex(idx)}
          >
            {p.nome} ({p.tipo})
          </div>
        ))}
      </div>

      {/* Mappa */}
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Polyline con transizione colore */}
        {punti.length > 1 &&
          punti.map((punto, i) =>
            i < punti.length - 1 ? (
              <Polyline key={i} positions={[punto, punti[i + 1]]} color={colors[i]} />
            ) : null
          )}

        {/* Marker con tooltip */}
        {posizioni.map((p, i) => (
          <Marker
            key={i}
            position={[p.lat, p.lng]}
            icon={p.tipo === "ingresso" ? BlueIcon : RedIcon}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
              {p.nome}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
