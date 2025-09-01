"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type RigaDati = {
  data: string;
  nominativo: string;
  matricola: string;
  comune: string;
  targa: string;
  presenze: string;
  assenze: string;
  ferie: string;
  malattia: string;
  infortunio: string;
  donazione_sangue: string;
  permesso_sind: string;
  cassa_int: string;
  permessi_vari: string;
  festivita: string;
  uscita: string;
  posizione: string;
};

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const password = searchParams.get("password") || "";
  const distretto = searchParams.get("distretto") || "";

  const [dati, setDati] = useState<RigaDati[]>([]);
  const [chartData, setChartData] = useState<{ nome: string; ore_lavorate: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState<string | null>(null);
  const [ultimoAggiornamento, setUltimoAggiornamento] = useState<Date | null>(null);
  const [updating, setUpdating] = useState(false);

  function calcolaOreLavorate(inizio: string, fine: string): number {
    if (!inizio || !fine) return NaN;
    const parseOrario = (h: string) => {
      const [oreStr, minStr] = h.split(".");
      const ore = parseInt(oreStr, 10);
      const minuti = parseInt(minStr || "0", 10);
      if (isNaN(ore) || isNaN(minuti)) return NaN;
      return ore + minuti / 60;
    };
    const oraInizio = parseOrario(inizio);
    const oraFine = parseOrario(fine);
    if (isNaN(oraInizio) || isNaN(oraFine)) return NaN;
    return oraFine - oraInizio;
  }

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const caricaDati = async () => {
      try {
        setUpdating(true);
        const res = await fetch(
          `/api/dati?email=${email}&password=${password}&distretto=${distretto}`
        );
        const json = await res.json();

        if (!res.ok) {
          setErrore(json?.error || "Errore sconosciuto");
          setDati([]);
          setChartData([]);
        } else {
          setErrore(null);
          setDati(json);

          // Prepara i dati per il grafico delle ore lavorate
          const convertiti = json.map((row: RigaDati) => {
            const ore = calcolaOreLavorate(row.presenze, row.uscita);
            return {
              nome: row.nominativo,
              ore_lavorate: isNaN(ore) ? 0 : ore,
            };
          });
          setChartData(convertiti);

          // aggiorna timestamp
          setUltimoAggiornamento(new Date());
        }
      } catch (err) {
        setErrore("Errore di rete o server non raggiungibile");
      } finally {
        setLoading(false);
        setUpdating(false);
      }
    };

    caricaDati();
    interval = setInterval(caricaDati, 30000);

    return () => clearInterval(interval);
  }, [email, password, distretto]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Dashboard – {distretto.toUpperCase()}
      </h1>

      <div className="flex gap-4 mb-4">
        <a
          href={`/permessi?email=${email}&password=${password}&distretto=${distretto}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Visualizza Permessi
        </a>
        <a
          href={`/mappa?email=${email}&password=${password}&distretto=${distretto}`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
        >
          Visualizza Mappa
        </a>
      </div>

      {/* Ultimo aggiornamento */}
      {ultimoAggiornamento && (
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <span>Ultimo aggiornamento: {ultimoAggiornamento.toLocaleTimeString()}</span>
          {updating && <span className="animate-pulse text-blue-500">⟳ Aggiornamento...</span>}
        </div>
      )}

      {loading && (
        <div className="text-gray-500 animate-pulse mt-6">
          Caricamento dati...
        </div>
      )}

      {!loading && errore && (
        <div className="text-red-600 font-medium mt-6">{errore}</div>
      )}

      {!loading && !errore && dati.length === 0 && (
        <div className="text-gray-600 mt-6">
          Nessun dato trovato per le credenziali inserite.
        </div>
      )}

      {!loading && dati.length > 0 && (
        <>
          {/* Tabella */}
          <div className="overflow-x-auto border rounded-lg shadow-sm max-h-[60vh] overflow-y-auto mt-6">
            <table className="min-w-full table-auto text-sm text-left">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 border-b">Data</th>
                  <th className="px-4 py-2 border-b">Nominativo</th>
                  <th className="px-4 py-2 border-b">Matricola</th>
                  <th className="px-4 py-2 border-b">Comune</th>
                  <th className="px-4 py-2 border-b">Targa</th>
                  <th className="px-4 py-2 border-b">Entrata</th>
                  <th className="px-4 py-2 border-b">Uscita</th>
                  <th className="px-4 py-2 border-b">Ore Lavorate</th>
                  <th className="px-4 py-2 border-b">Assenze</th>
                  <th className="px-4 py-2 border-b">Ferie</th>
                  <th className="px-4 py-2 border-b">Malattia</th>
                  <th className="px-4 py-2 border-b">Infortunio</th>
                  <th className="px-4 py-2 border-b">Donazione Sangue</th>
                  <th className="px-4 py-2 border-b">Permesso Sindacale</th>
                  <th className="px-4 py-2 border-b">Cassa Interna</th>
                  <th className="px-4 py-2 border-b">Permessi Vari</th>
                  <th className="px-4 py-2 border-b">Festività</th>
                </tr>
              </thead>
              <tbody>
                {dati.map((row, i) => {
                  const ore = calcolaOreLavorate(row.presenze, row.uscita);
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 border-b">{row.data}</td>
                      <td className="px-4 py-2 border-b">{row.nominativo}</td>
                      <td className="px-4 py-2 border-b">{row.matricola}</td>
                      <td className="px-4 py-2 border-b">{row.comune}</td>
                      <td className="px-4 py-2 border-b">{row.targa}</td>
                      <td className="px-4 py-2 border-b text-green-700 font-semibold">{row.presenze}</td>
                      <td className="px-4 py-2 border-b text-green-700 font-semibold">{row.uscita}</td>
                      <td className="px-4 py-2 border-b">{isNaN(ore) ? "-" : ore.toFixed(2)}</td>
                      <td className="px-4 py-2 border-b text-red-600 font-semibold">{row.assenze}</td>
                      <td className="px-4 py-2 border-b text-blue-600 font-semibold">{row.ferie}</td>
                      <td className="px-4 py-2 border-b">{row.malattia}</td>
                      <td className="px-4 py-2 border-b">{row.infortunio}</td>
                      <td className="px-4 py-2 border-b">{row.donazione_sangue}</td>
                      <td className="px-4 py-2 border-b">{row.permesso_sind}</td>
                      <td className="px-4 py-2 border-b">{row.cassa_int}</td>
                      <td className="px-4 py-2 border-b text-yellow-600 font-semibold">{row.permessi_vari}</td>
                      <td className="px-4 py-2 border-b">{row.festivita}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Grafico ore lavorate */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold mb-4">Grafico: Ore Lavorate</h2>
            <div className="space-y-6">
              {chartData.map((row, i) => (
                <div key={i}>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {row.nome} – {row.ore_lavorate.toFixed(2)} ore
                  </p>
                  <div className="flex h-5 rounded overflow-hidden bg-gray-200 shadow-inner">
                    <div
                      className="bg-blue-600 transition-all duration-500"
                      style={{ width: `${row.ore_lavorate * 10}px` }}
                      title={`${row.ore_lavorate} ore`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
