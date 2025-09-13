"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Nominativo = { nome: string; matricola: string };
type RecordStorico = Record<string, any>;

const distretti = [
  { label: "Distretto 1", value: "distretto1" },
  { label: "Distretto 2", value: "distretto2" },
  { label: "Distretto 3", value: "distretto3" },
  { label: "Distretto 4", value: "distretto4" },
  { label: "Distretto 5", value: "distretto5" },
  { label: "Distretto 6", value: "distretto6" },
  { label: "Distretto 7", value: "distretto7" },
  { label: "Distretto 8", value: "distretto8" },
  { label: "Distretto 9", value: "distretto9" },
  { label: "Distretto 10", value: "distretto10" },
  { label: "Distretto 11", value: "distretto11" },
  // ... aggiungi gli altri distretti
];

export default function StoricoOperaio() {
  const [distretto, setDistretto] = useState<string>("");
  const [nominativi, setNominativi] = useState<Nominativo[]>([]);
  const [matricola, setMatricola] = useState<string>("");
  const [storico, setStorico] = useState<RecordStorico[]>([]);
  const [mese, setMese] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Carica nominativi quando cambia il distretto
  useEffect(() => {
    if (!distretto) return;
    setNominativi([]);
    setMatricola("");
    setStorico([]);
    setError("");

    fetch(`/api/Nominativi?distretto=${distretto}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNominativi(data);
        } else if (Array.isArray(data.nominativi)) {
          setNominativi(data.nominativi);
        } else {
          setNominativi([]);
          setError("Formato nominativi non valido");
        }
      })
      .catch(err => setError(err.message || "Errore nel caricamento nominativi"));
  }, [distretto]);

  // Carica storico quando cambiano matricola o mese
  useEffect(() => {
    if (!matricola) return;
    setLoading(true);
    setStorico([]);
    setError("");

    fetch(`/api/Storicooperaio?distretto=${distretto}&matricola=${matricola}&mese=${mese}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStorico(data);
        } else if (data.message) {
          setStorico([]);
          setError(data.message);
        } else {
          setStorico([]);
          setError("Formato dati storico non valido");
        }
      })
      .catch(err => setError(err.message || "Errore nel caricamento storico"))
      .finally(() => setLoading(false));
  }, [matricola, mese, distretto]);
   

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Storico Operai</h1>
      <div>
      <Link href="/Storico">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded transition w-60">
           RITORNA A STORICO MENSILITA'
          </button>
        </Link>
        </div>

      {/* Selezione distretto */}
      <div>
        <label>Distretto:</label>
        <select
          className="ml-2 border px-2 py-1"
          value={distretto}
          onChange={e => setDistretto(e.target.value)}
        >
          <option value="">Seleziona...</option>
          {distretti.map(d => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Selezione nominativo */}
      {Array.isArray(nominativi) && nominativi.length > 0 && (
        <div>
          <label>Nome:</label>
          <select
            className="ml-2 border px-2 py-1"
            value={matricola}
            onChange={e => setMatricola(e.target.value)}
          >
            <option value="">Seleziona...</option>
            {nominativi.map(n => (
              <option key={n.matricola} value={n.matricola}>
                {n.nome} ({n.matricola})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selezione mese */}
      {matricola && (
        <div>
          <label>Mese:</label>
          <input
            type="month"
            className="ml-2 border px-2 py-1"
            value={mese}
            onChange={e => setMese(e.target.value)}
          />
        </div>
      )}

      {/* Messaggi */}
      {error && <p className="text-red-600">{error}</p>}
      {loading && <p>Caricamento...</p>}
      {!loading && storico.length === 0 && !error && matricola && <p>Nessun dato trovato.</p>}

      {/* Tabella storico */}
      {storico.length > 0 && (
        <table className="border-collapse border w-full mt-4">
          <thead>
            <tr>
              {Object.keys(storico[0]).map(k => (
                <th key={k} className="border px-2 py-1 bg-gray-200">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {storico.map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j} className="border px-2 py-1">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
