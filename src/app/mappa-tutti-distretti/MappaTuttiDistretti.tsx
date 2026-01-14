"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Posizione } from "@/components/MappaLeaflet";
import { useSearchParams } from "next/navigation";

const MappaLeafletComponent = dynamic(() => import("@/components/MappaLeaflet"), {
  ssr: false,
});

type Stato = "presente" | "assente" | "ferie" | "malattia" | "permessi"|"cassa_integrazione";

interface PosizioneDistretto {
  latitudine: number;
  longitudine: number;
  nominativo: string;
  stato: Stato;
  comune: string;
  matricola: string;
  distretto: string;
  direttore_lavori: string;
  chilometri_percorsi: string;
  data?: string;
}

export default function MappaTuttiDistretti() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [posizioni, setPosizioni] = useState<PosizioneDistretto[]>([]);
  const [datiPerDistretto, setDatiPerDistretto] = useState<Record<string, PosizioneDistretto[]>>({});
  const [selezionato, setSelezionato] = useState<PosizioneDistretto | null>(null);

  // 🔄 Stati per polling e caricamento
  const [loading, setLoading] = useState(true);
  const [aggiornamento, setAggiornamento] = useState(false);
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState<string>("");

  // 🔍 Filtri
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroStato, setFiltroStato] = useState<Stato | "">("");
  const [filtroComune, setFiltroComune] = useState("");
  const [filtroDirettore, setFiltroDirettore] = useState("");

  // 🧭 Stato aggiunto: per centrare mappa una sola volta
  const [centraMappa, setCentraMappa] = useState<{ lat: number; lng: number } | null>(null);
  const [haCentrato, setHaCentrato] = useState(false);

  useEffect(() => {
    const e = searchParams.get("email") || "";
    const p = searchParams.get("password") || "";
    setEmail(e);
    setPassword(p);
  }, [searchParams]);

  // 🔁 Polling ottimizzato
  useEffect(() => {
    if (!email || !password) return;

    let primoCaricamento = true;

    const caricaDati = async () => {
      if (!primoCaricamento) setAggiornamento(false);

      try {
        const res = await fetch(`/api/tutti-distretti?email=${email}&password=${password}`);
        const json = await res.json();

        const dati: PosizioneDistretto[] = [];
        const statiValidi = ["presente", "assente", "ferie", "malattia", "permessi","cassa_integrazione"];

        Object.entries(json).forEach(([distretto, nominativi]) => {
          if (Array.isArray(nominativi)) {
            nominativi.forEach((n: any) => {
              const lat = parseFloat(n.latitudine);
              const lng = parseFloat(n.longitudine);
              if (isNaN(lat) || isNaN(lng)) return;

              const statoNorm = (n.stato || "").toString().trim().toLowerCase();
              const statoValido = statiValidi.includes(statoNorm)
                ? (statoNorm as Stato)
                : "assente";

              dati.push({
                latitudine: lat,
                longitudine: lng,
                nominativo: n.nominativo?.trim() || "",
                stato: statoValido,
                matricola: n.matricola?.trim() || `${distretto}-${n.nominativo}`,
                distretto,
                comune: n.comune?.trim() || "",
                direttore_lavori: n.direttore_lavori ?? "",
                chilometri_percorsi: n.chilometri_percorsi ?? "",
                data: n.data ?? "",
              });
            });
          }
        });

        if (dati.length > 0) {
          setPosizioni(dati);
        }

        const perDistretto: Record<string, PosizioneDistretto[]> = {};
        Object.entries(json).forEach(([distretto, nominativi]) => {
          if (Array.isArray(nominativi)) {
            perDistretto[distretto] = nominativi
              .filter((n: any) => !isNaN(parseFloat(n.latitudine)) && !isNaN(parseFloat(n.longitudine)))
              .map((n: any) => {
                const statoNorm = (n.stato || "").toString().trim().toLowerCase();
                const statoValido = statiValidi.includes(statoNorm)
                  ? (statoNorm as Stato)
                  : "assente";
                return {
                  latitudine: parseFloat(n.latitudine),
                  longitudine: parseFloat(n.longitudine),
                  nominativo: n.nominativo?.trim() || "",
                  stato: statoValido,
                  matricola: n.matricola?.trim() || `${distretto}-${n.nominativo}`,
                  distretto,
                  comune: n.comune?.trim() || "",
                  direttore_lavori: n.direttore_lavori ?? "",
                  chilometri_percorsi: n.chilometri_percorsi ?? "",
                  data: n.data ?? "",
                };
              });
          }
        });

        if (Object.keys(perDistretto).length > 0) {
          setDatiPerDistretto(perDistretto);
        }

        setUltimoAggiornamento(new Date().toLocaleTimeString());
      } catch (err) {
        console.error("Errore nel caricamento dati:", err);
      } finally {
        setAggiornamento(false);
        setLoading(false);
        primoCaricamento = false;
      }
    };

    caricaDati();
    const interval = setInterval(caricaDati, 40000);
    return () => clearInterval(interval);
  }, [email, password]);

  // 🔢 Contatori per distretto
  const contatori = useMemo(() => {
    const statiValidi = ["presente", "assente", "ferie", "malattia", "permessi","cassa_integrazione"] as const;
    type Stato = typeof statiValidi[number];
    const countsPerDistretto: Record<string, Record<Stato, number>> = {};

    Object.entries(datiPerDistretto).forEach(([distretto, nominativi]) => {
      const counts: Record<Stato, number> = {
        presente: 0,
        assente: 0,
        ferie: 0,
        malattia: 0,
        permessi: 0,
        cassa_integrazione:0,
      };
      if (Array.isArray(nominativi)) {
        nominativi.forEach((n) => {
          if (statiValidi.includes(n.stato as Stato)) counts[n.stato as Stato]++;
        });
      }
      countsPerDistretto[distretto] = counts;
    });
    return countsPerDistretto;
  }, [datiPerDistretto]);

  // 🔍 Filtri
  const datiFiltrati = useMemo(() => {
    return Object.fromEntries(
      Object.entries(datiPerDistretto).map(([distretto, nominativi]) => [
        distretto,
        (nominativi as PosizioneDistretto[]).filter((n) => {
          const matchNome = n.nominativo.toLowerCase().includes(filtroNome.toLowerCase());
          const matchStato = !filtroStato || n.stato === filtroStato;
          const matchComune = !filtroComune || n.comune.toLowerCase().includes(filtroComune.toLowerCase());
          const matchDirettore =
            !filtroDirettore || n.direttore_lavori.toLowerCase() === filtroDirettore.toLowerCase();
          return matchNome && matchStato && matchComune && matchDirettore;
        }),
      ])
    );
  }, [datiPerDistretto, filtroNome, filtroStato, filtroComune, filtroDirettore]);

  const comuniUnici = useMemo(() => {
    return Array.from(new Set(posizioni.map((p) => p.comune))).sort();
  }, [posizioni]);

  const direttoriUnici = useMemo(() => {
    return Array.from(
      new Set(posizioni.map((p) => p.direttore_lavori?.trim()).filter((d) => d && d.length > 0))
    )
      .sort((a: string, b: string) => a.localeCompare(b))
      .map(String);
  }, [posizioni]);

  // ⏱ Disattiva centraMappa dopo un secondo
  useEffect(() => {
    if (centraMappa && !haCentrato) {
      const timer = setTimeout(() => {
        setCentraMappa(null);
        setHaCentrato(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [centraMappa, haCentrato]);

  return (
    <div className="flex h-screen">
      {/* Sidebar sinistra */}
      <div className="w-96 p-4 bg-gray-100 overflow-y-auto grid grid-cols-2 gap-4">
        {/* Distretti */}
        <div className="space-y-4">
          <h2 className="font-bold mb-2 text-lg">Distretti</h2>
          {Object.entries(datiPerDistretto).map(([distretto]) => (
            <div key={distretto} className="p-2 bg-white rounded shadow">
              <h3 className="font-semibold">{distretto.toUpperCase()}</h3>
              <div className="text-xs mt-1 space-y-1">
                <div className="flex justify-between">
                  <span className="text-green-600 font-semibold">Presenti</span>
                  <span>{contatori[distretto]?.presente ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-semibold">Assenti</span>
                  <span>{contatori[distretto]?.assente ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-500 font-semibold">Ferie</span>
                  <span>{contatori[distretto]?.ferie ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-500 font-semibold">Malattia</span>
                  <span>{contatori[distretto]?.malattia ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-500 font-semibold">Permessi</span>
                  <span>{contatori[distretto]?.permessi ?? 0}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-blue-500 font-semibold"> Cassa_integrazione</span>
                  <span>{contatori[distretto]?.cassa_integrazione ?? 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nominativi */}
        <div className="space-y-4">
          <h2 className="font-bold mb-2 text-lg">Nominativi</h2>

          <div className="bg-white p-2 rounded shadow space-y-2 text-xs">
            <input
              type="text"
              placeholder="🔍 Cerca nominativo..."
              className="w-full border rounded p-1 text-xs"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
            <select
              className="w-full border rounded p-1 text-xs"
              value={filtroStato}
              onChange={(e) => setFiltroStato(e.target.value as Stato | "")}
            >
              <option value="">Tutti gli stati</option>
              <option value="presente">Presente</option>
              <option value="assente">Assente</option>
              <option value="ferie">Ferie</option>
              <option value="malattia">Malattia</option>
              <option value="permessi">Permessi</option>
              <option value="cassa_integrazione">Cassa_integrazione</option>
            </select>

            <select
              className="w-full border rounded p-1 text-xs"
              value={filtroComune}
              onChange={(e) => setFiltroComune(e.target.value)}
            >
              <option value="">Tutti i comuni</option>
              {comuniUnici.map((comune) => (
                <option key={comune} value={comune}>
                  {comune}
                </option>
              ))}
            </select>

            <select
              className="w-full border rounded p-1 text-xs"
              value={filtroDirettore}
              onChange={(e) => setFiltroDirettore(e.target.value)}
            >
              <option value="">Tutti i direttori lavori</option>
              {direttoriUnici.map((dl) => (
                <option key={dl} value={dl}>
                  {dl}
                </option>
              ))}
            </select>
          </div>

          {Object.entries(datiFiltrati).map(([distretto, nominativi]) => (
            <div key={distretto} className="p-2 bg-white rounded shadow">
              <h3 className="font-semibold">{distretto.toUpperCase()}</h3>
              <ul className="text-xs mt-1 space-y-1">
                {Array.isArray(nominativi) &&
                  nominativi.map((n) => {
                    const statoColor =
                      n.stato === "presente"
                        ? "text-green-600"
                        : n.stato === "assente"
                        ? "text-black-500"
                        : n.stato === "ferie"
                        ? "text-yellow-500"
                        : n.stato === "permessi"
                        ? "text-blue-500"
                        : n.stato === "malattia"
                        ? "text-red-500"
                         : n.stato === "cassa_integrazione"
                        ? "text-red-500"
                        : "text-black";

                    return (
                      <li key={`${distretto}-${n.matricola}`}>
                        <button
                          onClick={() => {
                            setSelezionato({ ...n, distretto });
                            setCentraMappa({ lat: n.latitudine, lng: n.longitudine });
                            setHaCentrato(false);
                          }}
                          className="hover:underline text-left w-full"
                        >
                          <span className={`font-bold ${statoColor}`}>{n.nominativo}</span> –{" "}
                          <span className={`italic ${statoColor}`}>{n.stato}</span> –{" "}
                          <span className="italic">comune: {n.comune}</span> –{" "}
                          <span className="italic">matricola: {n.matricola}</span> –{" "}
                          <span className="italic font-bold ">DL: {n.direttore_lavori}</span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Mappa */}
      <div className="flex-1 relative">
        {aggiornamento && (
          <div className="absolute top-3 right-3 bg-yellow-200 text-yellow-800 px-3 py-1 rounded shadow text-xs animate-pulse z-50">
            🔄 Aggiornamento in corso... ({ultimoAggiornamento})
          </div>
        )}
        {!aggiornamento && ultimoAggiornamento && (
          <div className="absolute top-3 right-3 bg-green-200 text-green-800 px-3 py-1 rounded shadow text-xs z-50">
            ✅ Ultimo aggiornamento: {ultimoAggiornamento}
          </div>
        )}

        <MappaLeafletComponent
          posizioni={Object.values(datiFiltrati)
            .flat()
            .map((p) => ({
              nome: p.nominativo,
              lat: p.latitudine,
              lng: p.longitudine,
              stato: p.stato,
              matricola: p.matricola,
              distretto: p.distretto,
              comune: p.comune,
              direttore_lavori: p.direttore_lavori,
              chilometri_percorsi: p.chilometri_percorsi,
              data: p.data ?? "",
            })) as unknown as Posizione[]}
          attivaClickPartenza={false}
          mostraSidebar={false}
          centraMappa={centraMappa}
          selezionato={selezionato ? { nome: selezionato.nominativo } : null}
        />
      </div>
    </div>
  );
}
