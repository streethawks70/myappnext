'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import * as XLSX from "xlsx";

const MappaLeaflet1 = dynamic(() => import("@/components/MappaLeaflet1"), {
  ssr: false,
});

const DISTRETTI = [
  "Distretto 1","Distretto 2","Distretto 3","Distretto 4","Distretto 5",
  "Distretto 6","Distretto 7","Distretto 8","Distretto 9","Distretto 10","Distretto 11",
];

const COLORI_STATO: Record<string, string> = {
  ferie: "yellow",
  malattia: "red",
  assente: "black",
  permessi: "purple",
  presente: "green",
  infortunio: "orange",
};

export default function DirettorePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [distretto, setDistretto] = useState("");
  const [dati, setDati] = useState<any[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ lat: number; lon: number; matricola: string } | null>(null);

  // Filtri
  const [filtroStato, setFiltroStato] = useState<string>("");
  const [filtroNome, setFiltroNome] = useState<string>("");
  const [filtroComune, setFiltroComune] = useState<string>("");

  const comuniUnici = Array.from(
  new Set(dati.map((item) => item.comune).filter(Boolean))
).sort();


  // Data odierna
  const oggi = new Date().toISOString().slice(0, 10);

  // Funzione per normalizzare le date dal foglio (13/09/2025 -> 2025-09-13)
  const normalizzaData = (val: string) => {
    if (!val) return "";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
      const [gg, mm, aaaa] = val.split("/");
      return `${aaaa}-${mm}-${gg}`;
    }
    return val;
  };

  // Carica dati
  const caricaDati = async () => {
    if (!email || !password || !distretto) return;

    try {
      setLoading(true);
      const res = await fetch(
        `/api/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&distretto=${encodeURIComponent(distretto)}`
      );
      const text = await res.text();
      if (text === "Unauthorized") {
        alert("Accesso negato.");
        setLoggedIn(false);
        return;
      }
      const json = JSON.parse(text);
      if (json.error) {
        alert(json.error);
        setLoggedIn(false);
        setDati([]);
      } else if (Array.isArray(json) && json.length > 0) {
        const datiConStato = json.map((riga: any) => {
          let stato = "assente";
          if (riga.presenze && riga.presenze.trim() !== "") stato = "presente";
          else if (riga.assenze && riga.assenze.trim() !== "") stato = "assente";
          else if(riga.uscita && riga.uscita.trim() !== "") stato = "uscita";
          else if (riga.malattia && riga.malattia.trim() !== "") stato = "malattia";
          else if (riga.infortunio && riga.infortunio.trim() !== "") stato = "infortunio";
          else if (riga.ferie && riga.ferie.trim() !== "") stato = "ferie";
          else if (riga.permessi && riga.permessi.trim() !== "") stato = "permessi";

          const dataNorm = normalizzaData(riga.data || riga.Data || "");

          return { ...riga, stato, dataNorm };
        });

        setDati(datiConStato);
        setLoggedIn(true);
        setLastUpdate(new Date().toLocaleTimeString());
      } else {
        alert("Nessun dato trovato.");
        setLoggedIn(false);
        setDati([]);
      }
    } catch (err) {
      alert("Errore durante il recupero dati.");
      setLoggedIn(false);
      setDati([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password || !distretto) {
      alert("Compila tutti i campi.");
      return;
    }
    await caricaDati();
  };

  // Refresh ogni 30 secondi
  useEffect(() => {
    if (!loggedIn) return;

    // Carica subito dati all'accesso
    caricaDati();

    const interval = setInterval(() => {
      caricaDati();
    }, 30000);

    return () => clearInterval(interval);
  }, [loggedIn, email, password, distretto]);

  // Filtri lato client
  const datiFiltratiLista = dati.filter((item) => {
    const matchData = item.dataNorm === oggi;
    const matchStato = filtroStato ? item.stato === filtroStato : true;
    const matchNome = filtroNome ? item.nominativo?.toLowerCase().includes(filtroNome.toLowerCase()) : true;
    const matchComune = filtroComune ? item.comune?.toLowerCase().includes(filtroComune.toLowerCase()) : true;
    return matchData && matchStato && matchNome && matchComune;
  });

  const datiFiltratiTabella = dati.filter((item) => {
    const matchStato = filtroStato ? item.stato === filtroStato : true;
    const matchNome = filtroNome ? item.nominativo?.toLowerCase().includes(filtroNome.toLowerCase()) : true;
    const matchComune = filtroComune ? item.comune?.toLowerCase().includes(filtroComune.toLowerCase()) : true;
    return matchStato && matchNome && matchComune;
  });

  // Export Excel della tabella superiore
  const exportToExcel = () => {
    if (!datiFiltratiTabella || datiFiltratiTabella.length === 0) {
      alert("Nessun dato da esportare.");
      return;
    }

    const rows = datiFiltratiTabella.map((r) => ({
      Data: r.dataNorm,
      Nome: r.nominativo ?? "",
      Matricola: r.matricola ?? "",
      Comune: r.comune ?? "",
      Targa: r.targa ?? "",
      Presenze: r.presenze ?? "",
      Uscita :r.uscita ?? "",
      Assenze: r.assenze ?? "",
      Ferie: r.ferie ?? "",
      Malattia: r.malattia ?? "",
      Infortunio: r.infortunio ?? "",
      Permessi: r.permessi ?? "",
      Stato: r.stato ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tabella");

    const filenameDistretto = distretto.replace(/\s+/g, "_") || "dati";
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${filenameDistretto}_${dateStr}.xlsx`);
  };

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">👷‍💼 Accesso Direttore Lavori</h2>
        <select value={distretto} onChange={(e) => setDistretto(e.target.value)} className="w-full border px-4 py-2 mb-4">
          <option value="">Seleziona Distretto</option>
          {DISTRETTI.map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>
        <input type="email" placeholder="Email del direttore" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-4 py-2 mb-4" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-4 py-2 mb-4" />
        <button onClick={handleLogin} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded w-full">
          {loading ? "Caricamento..." : "Accedi"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4 space-y-4">
      {/* Filtri + bottoni */}
      <div className="flex gap-4 flex-wrap mb-2 items-center">
        <select value={filtroStato} onChange={(e) => setFiltroStato(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Tutti gli stati</option>
          {Object.keys(COLORI_STATO).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="text" placeholder="Cerca nominativo..." value={filtroNome} onChange={(e) => setFiltroNome(e.target.value)} className="border px-3 py-2 rounded" />
        <select
  value={filtroComune}
  onChange={(e) => setFiltroComune(e.target.value)}
  className="border px-3 py-2 rounded"
>
  <option value="">Tutti i comuni</option>
  {comuniUnici.map((c, i) => (
    <option key={i} value={c}>
      {c}
    </option>
  ))}
</select>


        <Link href={{ pathname: '/Resoconto', query: { email, password, distretto } }}>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition">Vai a ore Lavorate e Permessi</button>
        </Link>

        <button onClick={exportToExcel} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed">Esporta Excel</button>
      </div>

      <div className="text-sm text-gray-600 mb-2">{loading ? "⏳ Aggiornamento in corso..." : `Ultimo aggiornamento: ${lastUpdate}`}</div>

      {/* Tabella superiore (tutti i dati) */}
      <div className="overflow-x-auto shadow-lg rounded-xl border border-gray-200 bg-white max-h-[400px] overflow-y-auto">
        <table className="min-w-full text-sm text-gray-700 font-medium">
          <thead className="bg-green-100 text-green-900 text-xs uppercase tracking-wide sticky top-0 z-10 shadow">
            <tr>
              {["Data","Nome","Matricola","Comune","Targa","Presenze","Uscita","Assenze","Ferie","Malattia","Infortunio","Permessi"].map((header, i) => (
                <th key={i} className="px-3 py-3 text-center border-b border-green-300 whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datiFiltratiTabella.map((riga, idx) => (
              <tr key={riga.matricola || idx} className="hover:bg-green-50 text-center">
                <td className="px-3 py-2 border-b">{riga.dataNorm}</td>
                <td className="px-3 py-2 border-b text-left">{riga.nominativo}</td>
                <td className="px-3 py-2 border-b">{riga.matricola}</td>
                <td className="px-3 py-2 border-b">{riga.comune}</td>
                <td className="px-3 py-2 border-b">{riga.targa}</td>
                <td className="px-3 py-2 border-b">{riga.presenze}</td>
                <td className="px-3 py-2 border-b">{riga.uscita}</td>
                <td className="px-3 py-2 border-b">{riga.assenze}</td>
                <td className="px-3 py-2 border-b">{riga.ferie}</td>
                <td className="px-3 py-2 border-b">{riga.malattia}</td>
                <td className="px-3 py-2 border-b">{riga.infortunio}</td>
                <td className="px-3 py-2 border-b">{riga.permessi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mappa + lista (solo oggi) */}
      <div className="flex gap-4">
        <div className="h-[500px] w-2/3 rounded-xl overflow-hidden shadow-lg">
          <MappaLeaflet1 dati={datiFiltratiLista} selected={selected} coloriStato={COLORI_STATO} />
        </div>

        <div className="h-[500px] w-1/3 overflow-y-auto rounded-xl border p-4 shadow-md bg-white">
          <h3 className="font-semibold mb-3">Nominativi (solo oggi)</h3>
          <ul className="space-y-2">
            {datiFiltratiLista.map((item, idx) => (
              <li key={item.matricola || idx} className="p-2 rounded cursor-pointer hover:bg-green-100"
                onClick={() => item.lat && item.lon ? setSelected({ lat: item.lat, lon: item.lon, matricola: item.matricola }) : null}>
                📍 {item.nominativo} — <span className="italic text-gray-600">{item.stato}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
