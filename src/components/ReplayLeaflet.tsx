"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Posizione as BasePosizione } from "@/components/MappaLeaflet";

// Importiamo la nuova mappa con replay
const MappaLeafletReplay = dynamic(
  () => import("./MappaLeafletReplay"),
  { ssr: false }
);

export type PosizioneReplay = BasePosizione & {
  data: string;
  ora: string;
  tipo: "ingresso" | "uscita";
};

type Props = {
  email: string;
  password: string;
  distretto: string;
};

export default function ReplayLeaflet({ email, password, distretto }: Props) {
  const [posizioni, setPosizioni] = useState<PosizioneReplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [indexReplay, setIndexReplay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Carica dati dal Google Sheet
  useEffect(() => {
    const caricaDati = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/dati?email=${email}&password=${password}&distretto=${distretto}`
        );
        const data = await res.json();

        const posizioniMappa: PosizioneReplay[] = data.flatMap((r: any) => {
          const posizioni: PosizioneReplay[] = [];

          // Ingresso
          if (r.lat && r.lng) {
            posizioni.push({
              nome: r.nominativo,
              lat: parseFloat(r.lat),
              lng: parseFloat(r.lng),
              tipo: "ingresso",
              data: r.data || "",
              ora: r.entrata || r.uscita || "",
              stato: r.stato?.toLowerCase() || "assente",
              comune: r.comune || "",
              matricola: r.matricola || "",
              direttore_lavori: r.direttore_lavori || "",
              chilometri_percorsi: r.chilometri_percorsi || "",
              distretto:r.distretto || "",
            });
          }

          // Uscita
          if (r.uscitaLat && r.uscitaLng) {
            posizioni.push({
              nome: r.nominativo,
              lat: parseFloat(r.uscitaLat),
              lng: parseFloat(r.uscitaLng),
              tipo: "uscita",
              data: r.data || "",
              ora: r.uscita || "",
              stato: r.stato?.toLowerCase() || "assente",
              comune: r.comune || "",
              matricola: r.matricola || "",
              direttore_lavori: r.direttore_lavori || "",
              chilometri_percorsi: r.chilometri_percorsi || "",
              distretto:r.distretto || "",
            });
          }

          return posizioni;
        });

        // Ordina per data+ora
        const ordinati = posizioniMappa.sort(
          (a, b) =>
            new Date(`${a.data} ${a.ora}`).getTime() -
            new Date(`${b.data} ${b.ora}`).getTime()
        );

        setPosizioni(ordinati);
        setIndexReplay(0);
      } catch (err) {
        console.error("Errore Replay:", err);
      } finally {
        setLoading(false);
      }
    };

    caricaDati();
  }, [email, password, distretto]);

  // Animazione replay
  useEffect(() => {
    if (!isPlaying || indexReplay >= posizioni.length) return;

    const timer = setTimeout(() => {
      setIndexReplay((prev) => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, indexReplay, posizioni]);

  if (loading) return <div>Caricamento dati...</div>;

  return (
    <div className="w-full">
      {/* Controlli replay */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isPlaying ? "Pausa" : "Play"}
        </button>
        <button
          onClick={() => {
            setIndexReplay(0);
            setIsPlaying(false);
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>

      <div className="h-[600px] w-full border rounded overflow-hidden">
        <MappaLeafletReplay
          posizioni={posizioni.slice(0, indexReplay + 1)}
        />
      </div>
    </div>
  );
}
